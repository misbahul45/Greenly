package product

import (
	"catalog-service/databases"
	"catalog-service/utils"
	"context"
	"errors"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Service interface {
	FindMany(ctx context.Context, query ProductQuery) ([]ProductResponse, int64, error)
	FindOne(ctx context.Context, id string) (ProductResponse, error)
	FindOneBySlug(ctx context.Context, slug string) (ProductResponse, error)
	Search(ctx context.Context, query ProductSearchQuery) ([]ProductResponse, int64, error)
	Create(ctx context.Context, dto CreateProductDTO) (databases.Product, error)
	Update(ctx context.Context, id string, dto UpdateProductDTO) (databases.Product, error)
	Delete(ctx context.Context, id string) error
	ToggleActive(ctx context.Context, id string, shopID string) (databases.Product, error)
	BulkUpdate(ctx context.Context, dto BulkUpdateProductDTO, shopID string) (BulkUpdateResponse, error)
	ValidateShopAndCategory(ctx context.Context, shopID, categoryID string) error
	EnableProductsByShop(ctx context.Context, shopID string) error
}

type service struct {
	repository Repository
}

var (
	ErrProductNotFound = errors.New("product not found")
	ErrSlugExists      = errors.New("product slug already exists")
	ErrShopInvalid     = errors.New("shop not found or not approved")
	ErrCategoryInvalid = errors.New("category not found")
)

func NewService(repository Repository) Service {
	return &service{
		repository: repository,
	}
}

func (s *service) FindMany(ctx context.Context, query ProductQuery) ([]ProductResponse, int64, error) {
	filter := bson.M{"deleted_at": bson.M{"$eq": nil}}

	if query.Search != "" {
		filter["$or"] = bson.A{
			bson.M{"name": bson.M{"$regex": query.Search, "$options": "i"}},
			bson.M{"description": bson.M{"$regex": query.Search, "$options": "i"}},
			bson.M{"sku": bson.M{"$regex": query.Search, "$options": "i"}},
		}
	}

	if query.ShopID != "" {
		filter["shop_id"] = query.ShopID
	}

	if query.CategoryID != "" {
		filter["category_id"] = query.CategoryID
	}

	if query.MinPrice > 0 || query.MaxPrice > 0 {
		priceFilter := bson.M{}
		if query.MinPrice > 0 {
			priceFilter["$gte"] = query.MinPrice
		}
		if query.MaxPrice > 0 {
			priceFilter["$lte"] = query.MaxPrice
		}
		filter["price"] = priceFilter
	}

	if query.MinRating > 0 {
		filter["rating_average"] = bson.M{"$gte": query.MinRating}
	}

	if query.IsActive != nil {
		filter["is_active"] = *query.IsActive
	}

	skip := int64(query.Page-1) * int64(query.Limit)
	limit := int64(query.Limit)

	sortField := query.SortBy
	if sortField == "" {
		sortField = "created_at"
	}
	sortOrder := -1
	if query.SortOrder == "asc" {
		sortOrder = 1
	}

	opts := options.Find().SetSkip(skip).SetLimit(limit).SetSort(bson.D{{Key: sortField, Value: sortOrder}})

	products, total, err := s.repository.FindMany(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]ProductResponse, len(products))
	for i, p := range products {
		responses[i] = s.enrichProductResponse(ctx, p)
	}

	return responses, total, nil
}

func (s *service) FindOne(ctx context.Context, id string) (ProductResponse, error) {
	product, err := s.repository.FindById(ctx, id)
	if err != nil {
		return ProductResponse{}, ErrProductNotFound
	}
	return s.enrichProductResponse(ctx, product), nil
}

func (s *service) FindOneBySlug(ctx context.Context, slug string) (ProductResponse, error) {
	product, err := s.repository.FindBySlug(ctx, slug)
	if err != nil {
		return ProductResponse{}, ErrProductNotFound
	}
	return s.enrichProductResponse(ctx, product), nil
}

func (s *service) Search(ctx context.Context, query ProductSearchQuery) ([]ProductResponse, int64, error) {
	filter := bson.M{
		"deleted_at": bson.M{"$eq": nil},
		"is_active":  true,
	}

	if query.Keyword != "" {
		filter["$text"] = bson.M{"$search": query.Keyword}
	}

	if len(query.ShopIDs) > 0 {
		filter["shop_id"] = bson.M{"$in": query.ShopIDs}
	}

	if query.CategoryID != "" {
		filter["category_id"] = query.CategoryID
	}

	if query.MinPrice > 0 || query.MaxPrice > 0 {
		priceFilter := bson.M{}
		if query.MinPrice > 0 {
			priceFilter["$gte"] = query.MinPrice
		}
		if query.MaxPrice > 0 {
			priceFilter["$lte"] = query.MaxPrice
		}
		filter["price"] = priceFilter
	}

	if query.MinRating > 0 {
		filter["rating_average"] = bson.M{"$gte": query.MinRating}
	}

	skip := int64(query.Page-1) * int64(query.Limit)
	limit := int64(query.Limit)

	sortField := query.SortBy
	if sortField == "" {
		sortField = "rating_average"
	}
	sortOrder := -1
	if query.SortOrder == "asc" {
		sortOrder = 1
	}

	opts := options.Find().SetSkip(skip).SetLimit(limit).SetSort(bson.D{{Key: sortField, Value: sortOrder}})

	products, total, err := s.repository.FindMany(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]ProductResponse, len(products))
	for i, p := range products {
		responses[i] = s.enrichProductResponse(ctx, p)
	}

	return responses, total, nil
}

func (s *service) Create(ctx context.Context, dto CreateProductDTO) (databases.Product, error) {
	if err := s.ValidateShopAndCategory(ctx, dto.ShopID, dto.CategoryID); err != nil {
		return databases.Product{}, err
	}

	slug := dto.Slug
	if slug == "" {
		slug = utils.GenerateProductSlug(dto.Name)
	}

	exists, _ := s.repository.FindBySlug(ctx, slug)
	if exists.ID != "" {
		return databases.Product{}, ErrSlugExists
	}

	product := databases.Product{
		ShopID:      dto.ShopID,
		CategoryID:  dto.CategoryID,
		Name:        dto.Name,
		Slug:        slug,
		Description: dto.Description,
		SKU:         dto.SKU,
		IsActive:    dto.IsActive,
	}
	product.BeforeCreate()

	created, err := s.repository.Create(ctx, product)
	if err != nil {
		return databases.Product{}, err
	}

	if dto.Price > 0 {
		price := databases.Price{
			Base:      databases.Base{ID: databases.NewID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
			ProductID: created.ID,
			Amount:    dto.Price,
			Currency:  dto.Currency,
		}
		s.repository.CreatePrice(ctx, price)
	}

	if dto.Stock > 0 {
		inventory := databases.Inventory{
			Base:      databases.Base{ID: databases.NewID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
			ProductID: created.ID,
			Stock:     dto.Stock,
		}
		s.repository.CreateInventory(ctx, inventory)
	}

	if len(dto.ImageURLs) > 0 {
		for i, url := range dto.ImageURLs {
			img := databases.ProductImage{
				Base:      databases.Base{ID: databases.NewID(), CreatedAt: time.Now(), UpdatedAt: time.Now()},
				ProductID: created.ID,
				URL:       url,
				IsPrimary: i == 0,
				Order:     i,
			}
			s.repository.CreateImage(ctx, img)
		}
	}

	return created, nil
}

func (s *service) Update(ctx context.Context, id string, dto UpdateProductDTO) (databases.Product, error) {
	existing, err := s.repository.FindById(ctx, id)
	if err != nil {
		return databases.Product{}, ErrProductNotFound
	}

	if dto.Slug != nil && *dto.Slug != existing.Slug {
		exists, _ := s.repository.FindBySlug(ctx, *dto.Slug)
		if exists.ID != "" && exists.ID != id {
			return databases.Product{}, ErrSlugExists
		}
		existing.Slug = *dto.Slug
	}

	if dto.Name != nil {
		existing.Name = *dto.Name
	}
	if dto.Description != nil {
		existing.Description = *dto.Description
	}
	if dto.SKU != nil {
		existing.SKU = *dto.SKU
	}
	if dto.CategoryID != nil {
		if err := s.validateCategory(ctx, *dto.CategoryID); err != nil {
			return databases.Product{}, err
		}
		existing.CategoryID = *dto.CategoryID
	}
	if dto.IsActive != nil {
		existing.IsActive = *dto.IsActive
	}

	existing.BeforeUpdate()

	updated, err := s.repository.Update(ctx, id, existing)
	if err != nil {
		return databases.Product{}, err
	}

	if dto.Price != nil || dto.Currency != nil {
		priceUpdate := bson.M{"$set": bson.M{"updated_at": time.Now()}}
		if dto.Price != nil {
			priceUpdate["$set"].(bson.M)["amount"] = *dto.Price
		}
		if dto.Currency != nil {
			priceUpdate["$set"].(bson.M)["currency"] = *dto.Currency
		}
		s.repository.UpdatePriceByProductID(ctx, updated.ID, priceUpdate)
	}

	if dto.Stock != nil {
		s.repository.UpdateInventoryStock(ctx, updated.ID, *dto.Stock)
	}

	if dto.ImageURLs != nil {
		s.repository.UpdateImages(ctx, updated.ID, dto.ImageURLs)
	}

	return updated, nil
}

func (s *service) Delete(ctx context.Context, id string) error {
	_, err := s.repository.FindById(ctx, id)
	if err != nil {
		return ErrProductNotFound
	}
	return s.repository.Delete(ctx, id)
}

func (s *service) ToggleActive(ctx context.Context, id string, shopID string) (databases.Product, error) {
	product, err := s.repository.FindById(ctx, id)
	if err != nil {
		return databases.Product{}, ErrProductNotFound
	}

	if product.ShopID != shopID {
		return databases.Product{}, errors.New("unauthorized: product does not belong to shop")
	}

	product.IsActive = !product.IsActive
	product.BeforeUpdate()

	return s.repository.Update(ctx, id, product)
}

func (s *service) BulkUpdate(ctx context.Context, dto BulkUpdateProductDTO, shopID string) (BulkUpdateResponse, error) {
	response := BulkUpdateResponse{FailedIDs: []string{}, Errors: []string{}}

	for _, productID := range dto.ProductIDs {
		product, err := s.repository.FindById(ctx, productID)
		if err != nil {
			response.FailedIDs = append(response.FailedIDs, productID)
			response.Errors = append(response.Errors, "product not found")
			continue
		}

		if product.ShopID != shopID {
			response.FailedIDs = append(response.FailedIDs, productID)
			response.Errors = append(response.Errors, "unauthorized")
			continue
		}

		update := bson.M{"$set": bson.M{"updated_at": time.Now()}}
		setData := update["$set"].(bson.M)

		if dto.Updates.Price != nil {
			setData["price"] = *dto.Updates.Price
		}
		if dto.Updates.Stock != nil {
			setData["stock"] = *dto.Updates.Stock
		}
		if dto.Updates.IsActive != nil {
			setData["is_active"] = *dto.Updates.IsActive
		}
		if dto.Updates.CategoryID != nil {
			if err := s.validateCategory(ctx, *dto.Updates.CategoryID); err != nil {
				response.FailedIDs = append(response.FailedIDs, productID)
				response.Errors = append(response.Errors, err.Error())
				continue
			}
			setData["category_id"] = *dto.Updates.CategoryID
		}

		err = s.repository.BulkUpdateOne(ctx, productID, update)
		if err != nil {
			response.FailedIDs = append(response.FailedIDs, productID)
			response.Errors = append(response.Errors, err.Error())
			continue
		}

		response.UpdatedCount++
	}

	return response, nil
}

func (s *service) ValidateShopAndCategory(ctx context.Context, shopID, categoryID string) error {
	if err := s.validateCategory(ctx, categoryID); err != nil {
		return err
	}
	return nil
}

func (s *service) EnableProductsByShop(ctx context.Context, shopID string) error {
	return s.repository.EnableProductsByShop(ctx, shopID)
}

func (s *service) validateCategory(ctx context.Context, categoryID string) error {
	_, err := s.repository.FindCategoryById(ctx, categoryID)
	if err != nil {
		return ErrCategoryInvalid
	}
	return nil
}

func (s *service) enrichProductResponse(ctx context.Context, product databases.Product) ProductResponse {
	response := ProductResponse{
		ID:            product.ID,
		ShopID:        product.ShopID,
		CategoryID:    product.CategoryID,
		Name:          product.Name,
		Slug:          product.Slug,
		Description:   product.Description,
		SKU:           product.SKU,
		FavoriteCount: product.FavoriteCount,
		ReviewCount:   product.ReviewCount,
		RatingAverage: product.RatingAverage,
		IsActive:      product.IsActive,
		CreatedAt:     product.CreatedAt,
		UpdatedAt:     product.UpdatedAt,
	}

	price, err := s.repository.GetActivePrice(ctx, product.ID)
	if err == nil {
		response.Price = price.Amount
		response.Currency = price.Currency
	}

	inventory, err := s.repository.GetInventory(ctx, product.ID)
	if err == nil {
		response.Stock = inventory.Stock
	}

	images, _ := s.repository.GetImages(ctx, product.ID)
	for _, img := range images {
		response.ImageURLs = append(response.ImageURLs, img.URL)
	}

	category, err := s.repository.FindCategoryById(ctx, product.CategoryID)
	if err == nil {
		response.CategoryName = category.Name
	}

	return response
}

func generateSlug(name string) string {
	slug := strings.ToLower(name)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = strings.ReplaceAll(slug, "_", "-")
	return slug + "-" + databases.NewID()[:8]
}