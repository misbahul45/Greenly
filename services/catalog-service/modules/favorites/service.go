package favorite

import (
	"catalog-service/databases"
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Service interface {
	Toggle(ctx context.Context, userID string, productID string) (ToggleFavoriteResponse, error)
	GetUserFavorites(ctx context.Context, userID string, query FavoriteQuery) ([]FavoriteResponse, int64, error)
	GetProductFavorites(ctx context.Context, productID string) ([]FavoriteResponse, error)
	IsFavorite(ctx context.Context, userID, productID string) (bool, error)
}

type service struct {
	repository          Repository
	productCollection   *mongo.Collection
	priceCollection     *mongo.Collection
	inventoryCollection *mongo.Collection
	imageCollection     *mongo.Collection
	categoryCollection  *mongo.Collection
}

func NewService(
	repository Repository,
	productCol *mongo.Collection,
	priceCol *mongo.Collection,
	inventoryCol *mongo.Collection,
	imageCol *mongo.Collection,
	categoryCol *mongo.Collection,
) Service {
	return &service{
		repository:          repository,
		productCollection:   productCol,
		priceCollection:     priceCol,
		inventoryCollection: inventoryCol,
		imageCollection:     imageCol,
		categoryCollection:  categoryCol,
	}
}

func (s *service) Toggle(ctx context.Context, userID string, productID string) (ToggleFavoriteResponse, error) {
	_, err := s.getProductByID(ctx, productID)
	if err != nil {
		return ToggleFavoriteResponse{}, ErrProductNotFound
	}

	isFav, err := s.repository.ToggleWithTransaction(ctx, userID, productID)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			isFav, err = s.repository.ToggleWithTransaction(ctx, userID, productID)
		}
		if err != nil {
			return ToggleFavoriteResponse{}, err
		}
	}

	return ToggleFavoriteResponse{IsFavorite: isFav, ProductID: productID}, nil
}

func (s *service) GetUserFavorites(ctx context.Context, userID string, query FavoriteQuery) ([]FavoriteResponse, int64, error) {
	skip := int64(query.Page-1) * int64(query.Limit)
	favorites, total, err := s.repository.FindByUser(ctx, userID, skip, int64(query.Limit))
	if err != nil {
		return nil, 0, err
	}

	responses, err := s.batchEnrich(ctx, favorites)
	if err != nil {
		// fall back to bare responses without product data
		bare := make([]FavoriteResponse, len(favorites))
		for i, f := range favorites {
			bare[i] = FavoriteResponse{
				ID:        f.ID,
				UserID:    f.UserID,
				ProductID: f.ProductID,
				ShopID:    f.ShopID,
				CreatedAt: f.CreatedAt,
			}
		}
		return bare, total, nil
	}
	return responses, total, nil
}

func (s *service) batchEnrich(ctx context.Context, favorites []Favorite) ([]FavoriteResponse, error) {
	if len(favorites) == 0 {
		return []FavoriteResponse{}, nil
	}

	productIDs := make([]string, len(favorites))
	for i, f := range favorites {
		productIDs[i] = f.ProductID
	}

	// Batch fetch products
	productMap := make(map[string]databases.Product)
	if cur, err := s.productCollection.Find(ctx, bson.M{"_id": bson.M{"$in": productIDs}}); err == nil {
		defer cur.Close(ctx)
		var products []databases.Product
		if cur.All(ctx, &products) == nil {
			for _, p := range products {
				productMap[p.ID] = p
			}
		}
	}

	// Batch fetch prices
	priceMap := make(map[string]float64)
	currencyMap := make(map[string]string)
	if cur, err := s.priceCollection.Find(ctx, bson.M{"product_id": bson.M{"$in": productIDs}}); err == nil {
		defer cur.Close(ctx)
		var prices []databases.Price
		if cur.All(ctx, &prices) == nil {
			for _, p := range prices {
				priceMap[p.ProductID] = p.Amount
				currencyMap[p.ProductID] = p.Currency
			}
		}
	}

	// Batch fetch inventories
	stockMap := make(map[string]int)
	if cur, err := s.inventoryCollection.Find(ctx, bson.M{"product_id": bson.M{"$in": productIDs}}); err == nil {
		defer cur.Close(ctx)
		var inventories []databases.Inventory
		if cur.All(ctx, &inventories) == nil {
			for _, inv := range inventories {
				stockMap[inv.ProductID] = inv.Stock
			}
		}
	}

	// Batch fetch first image per product (sorted by order asc)
	imageMap := make(map[string]string)
	if cur, err := s.imageCollection.Find(ctx,
		bson.M{"product_id": bson.M{"$in": productIDs}},
		options.Find().SetSort(bson.D{{Key: "product_id", Value: 1}, {Key: "order", Value: 1}}),
	); err == nil {
		defer cur.Close(ctx)
		var images []databases.ProductImage
		if cur.All(ctx, &images) == nil {
			for _, img := range images {
				if _, exists := imageMap[img.ProductID]; !exists {
					imageMap[img.ProductID] = img.URL
				}
			}
		}
	}

	// Collect category IDs then batch fetch category names
	categoryIDSet := make(map[string]struct{})
	for _, p := range productMap {
		if p.CategoryID != "" {
			categoryIDSet[p.CategoryID] = struct{}{}
		}
	}
	categoryIDs := make([]string, 0, len(categoryIDSet))
	for id := range categoryIDSet {
		categoryIDs = append(categoryIDs, id)
	}
	categoryMap := make(map[string]string)
	if len(categoryIDs) > 0 {
		if cur, err := s.categoryCollection.Find(ctx, bson.M{"_id": bson.M{"$in": categoryIDs}}); err == nil {
			defer cur.Close(ctx)
			var categories []databases.Category
			if cur.All(ctx, &categories) == nil {
				for _, cat := range categories {
					categoryMap[cat.ID] = cat.Name
				}
			}
		}
	}

	// Build responses
	responses := make([]FavoriteResponse, len(favorites))
	for i, f := range favorites {
		resp := FavoriteResponse{
			ID:        f.ID,
			UserID:    f.UserID,
			ProductID: f.ProductID,
			ShopID:    f.ShopID,
			CreatedAt: f.CreatedAt,
		}

		if p, ok := productMap[f.ProductID]; ok {
			currency := currencyMap[p.ID]
			if currency == "" {
				currency = "IDR"
			}
			resp.Product = &FavoriteProductSnapshot{
				ID:            p.ID,
				Name:          p.Name,
				Slug:          p.Slug,
				ImageURL:      imageMap[p.ID],
				Price:         priceMap[p.ID],
				Currency:      currency,
				Stock:         stockMap[p.ID],
				ShopName:      p.ShopName,
				CategoryName:  categoryMap[p.CategoryID],
				RatingAverage: p.RatingAverage,
				ReviewCount:   p.ReviewCount,
				FavoriteCount: p.FavoriteCount,
			}
		}

		responses[i] = resp
	}

	return responses, nil
}

func (s *service) GetProductFavorites(ctx context.Context, productID string) ([]FavoriteResponse, error) {
	favorites, err := s.repository.FindByProduct(ctx, productID)
	if err != nil {
		return nil, err
	}

	responses := make([]FavoriteResponse, len(favorites))
	for i, f := range favorites {
		responses[i] = FavoriteResponse{
			ID:        f.ID,
			UserID:    f.UserID,
			ProductID: f.ProductID,
			ShopID:    f.ShopID,
			CreatedAt: f.CreatedAt,
		}
	}
	return responses, nil
}

func (s *service) IsFavorite(ctx context.Context, userID, productID string) (bool, error) {
	_, err := s.repository.FindByUserAndProduct(ctx, userID, productID)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (s *service) getProductByID(ctx context.Context, productID string) (databases.Product, error) {
	var product databases.Product
	err := s.productCollection.FindOne(ctx, bson.M{"_id": productID, "deleted_at": nil}).Decode(&product)
	return product, err
}

var ErrProductNotFound = errors.New("product not found")
