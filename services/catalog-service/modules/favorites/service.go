package favorite

import (
	"catalog-service/databases"
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
)

type Service interface {
	Toggle(ctx context.Context, userID string, productID string) (ToggleFavoriteResponse, error)
	GetUserFavorites(ctx context.Context, userID string, query FavoriteQuery) ([]FavoriteResponse, int64, error)
	GetProductFavorites(ctx context.Context, productID string) ([]FavoriteResponse, error)
	IsFavorite(ctx context.Context, userID, productID string) (bool, error)
}

type service struct {
	repository     Repository
	productCollection *mongoCollectionAccessor
}

type mongoCollectionAccessor interface {
	FindOne(ctx context.Context, filter interface{}) interface{ Decode(v interface{}) error }
}

func NewService(repository Repository, productCollection *mongo.Collection) Service {
	return &service{
		repository:     repository,
		productCollection: productCollection,
	}
}

func (s *service) Toggle(ctx context.Context, userID string, productID string) (ToggleFavoriteResponse, error) {
	existing, err := s.repository.FindByUserAndProduct(ctx, userID, productID)
	if err == nil && existing.ID != "" {
		err = s.repository.Delete(ctx, userID, productID)
		if err != nil {
			return ToggleFavoriteResponse{}, err
		}
		return ToggleFavoriteResponse{
			IsFavorite: false,
			ProductID:  productID,
		}, nil
	}

	product, err := s.getProductByID(ctx, productID)
	if err != nil {
		return ToggleFavoriteResponse{}, ErrProductNotFound
	}

	favorite := Favorite{
		UserID:    userID,
		ProductID: productID,
		ShopID:    product.ShopID,
	}
	favorite.BeforeCreate()

	_, err = s.repository.Create(ctx, favorite)
	if err != nil {
		return ToggleFavoriteResponse{}, err
	}

	return ToggleFavoriteResponse{
		IsFavorite: true,
		ProductID:  productID,
	}, nil
}

func (s *service) GetUserFavorites(ctx context.Context, userID string, query FavoriteQuery) ([]FavoriteResponse, int64, error) {
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.Limit <= 0 || query.Limit > 100 {
		query.Limit = 20
	}

	skip := int64(query.Page-1) * int64(query.Limit)
	limit := int64(query.Limit)

	favorites, total, err := s.repository.FindByUser(ctx, userID, skip, limit)
	if err != nil {
		return nil, 0, err
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

	return responses, total, nil
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
		if err.Error() == "mongo: no documents in result" {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (s *service) getProductByID(ctx context.Context, productID string) (databases.Product, error) {
	var product databases.Product
	err := s.productCollection.FindOne(ctx, bson.M{
		"_id":        productID,
		"deleted_at": nil,
	}).Decode(&product)
	return product, err
}

var ErrProductNotFound = errors.New("product not found")