package product

import (
	"catalog-service/databases"
	"catalog-service/utils"
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Service interface {
	FindMany(ctx context.Context, query ProductQuery) ([]databases.Product, int64, error)
	FindOne(ctx context.Context, id string) (databases.Product, error)
	FindOneBySlug(ctx context.Context, slug string) (databases.Product, error)
	Create(ctx context.Context, dto CreateProductDTO) (databases.Product, error)
	Update(ctx context.Context, id string, dto UpdateProductDTO) (databases.Product, error)
	Delete(ctx context.Context, id string) error
}

var (
	ErrProductNotFound = errors.New("product not found")
	ErrSlugExists      = errors.New("product slug already exists")
)

func setString(dst *string, src *string) {
	if src != nil {
		*dst = *src
	}
}

func setBool(dst *bool, src *bool) {
	if src != nil {
		*dst = *src
	}
}

type service struct {
	repository Repository
}

func NewService(repository Repository) Service {
	return &service{
		repository: repository,
	}
}

func (s *service) FindMany(
	ctx context.Context,
	query ProductQuery,
) ([]databases.Product, int64, error) {

	filter := bson.M{}

	if query.Search != "" {
		filter["$or"] = []bson.M{
			{
				"name": bson.M{
					"$regex":   query.Search,
					"$options": "i",
				},
			},
			{
				"description": bson.M{
					"$regex":   query.Search,
					"$options": "i",
				},
			},
		}
	}

	if query.CategoryID != "" {
		filter["category_id"] = query.CategoryID
	}

	if query.ShopID != "" {
		filter["shop_id"] = query.ShopID
	}

	if query.IsActive != nil {
		filter["is_active"] = *query.IsActive
	}

	if query.Page <= 0 {
		query.Page = 1
	}

	if query.Limit <= 0 {
		query.Limit = 10
	}

	skip := int64(query.Page-1) * int64(query.Limit)
	limit := int64(query.Limit)

	sort := bson.D{{Key: "created_at", Value: -1}}

	if query.SortBy != "" {
		order := 1
		if query.SortOrder == "desc" {
			order = -1
		}

		sort = bson.D{{Key: query.SortBy, Value: order}}
	}

	opts := options.Find().
		SetSkip(skip).
		SetLimit(limit).
		SetSort(sort)

	return s.repository.FindMany(ctx, filter, opts)
}

func (s *service) FindOne(
	ctx context.Context,
	id string,
) (databases.Product, error) {

	product, err := s.repository.FindById(ctx, id)
	if err != nil {
		return databases.Product{}, ErrProductNotFound
	}

	return product, nil
}

func (s *service) FindOneBySlug(
	ctx context.Context,
	slug string,
) (databases.Product, error) {

	product, err := s.repository.FindBySlug(ctx, slug)
	if err != nil {
		return databases.Product{}, ErrProductNotFound
	}

	return product, nil
}

func (s *service) Create(
	ctx context.Context,
	dto CreateProductDTO,
) (databases.Product, error) {

	slug := dto.Slug
	if slug == "" {
		slug = utils.GenerateProductSlug(dto.Name)
	}

	existed, _ := s.repository.FindBySlug(ctx, slug)
	if existed.ID != "" {
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
		InventoryID: dto.InventoryID,
		PriceID:     dto.PriceID,
		ImageIDs:    dto.ImageIDs,
		DiscountIDs: dto.DiscountIDs,
		EcoID:       dto.EcoID,
	}

	product.BeforeCreate()

	return s.repository.Create(ctx, product)
}

func (s *service) Update(
	ctx context.Context,
	id string,
	dto UpdateProductDTO,
) (databases.Product, error) {

	product, err := s.repository.FindById(ctx, id)
	if err != nil {
		return databases.Product{}, ErrProductNotFound
	}

	if dto.Name != nil {
		product.Name = *dto.Name
	}

	if dto.Slug != nil {
		product.Slug = *dto.Slug
	}

	if dto.Description != nil {
		product.Description = *dto.Description
	}

	if dto.SKU != nil {
		product.SKU = *dto.SKU
	}

	if dto.CategoryID != nil {
		product.CategoryID = *dto.CategoryID
	}

	if dto.IsActive != nil {
		product.IsActive = *dto.IsActive
	}

	if dto.InventoryID != nil {
		product.InventoryID = dto.InventoryID
	}

	if dto.PriceID != nil {
		product.PriceID = dto.PriceID
	}

	if dto.ImageIDs != nil {
		product.ImageIDs = dto.ImageIDs
	}

	if dto.DiscountIDs != nil {
		product.DiscountIDs = dto.DiscountIDs
	}

	if dto.EcoID != nil {
		product.EcoID = dto.EcoID
	}

	product.BeforeUpdate()

	return s.repository.Update(ctx, id, product)
}

func (s *service) Delete(
	ctx context.Context,
	id string,
) error {

	_, err := s.repository.FindById(ctx, id)
	if err != nil {
		return ErrProductNotFound
	}

	return s.repository.Delete(ctx, id)
}