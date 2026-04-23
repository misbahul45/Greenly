package category

import (
	"catalog-service/databases"
	"context"
	"errors"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Service interface {
	FindMany(ctx context.Context, query CategoryQuery) ([]databases.Category, int64, error)
	FindOne(ctx context.Context, id string) (databases.Category, error)
	Create(ctx context.Context, dto CreateCategoryDTO) (databases.Category, error)
	Update(ctx context.Context, id string, dto UpdateCategoryDTO) (databases.Category, error)
	Delete(ctx context.Context, id string) error
}

type service struct {
	repository Repository
}

var (
	ErrCategoryNotFound = errors.New("category not found")
	ErrSlugExists       = errors.New("category slug already exists")
)

func NewService(repository Repository) Service {
	return &service{
		repository: repository,
	}
}

func (s *service) FindMany(
	ctx context.Context,
	query CategoryQuery,
) ([]databases.Category, int64, error) {

	filter := bson.M{}

	if query.Search != "" {
		filter["name"] = bson.M{
			"$regex":   query.Search,
			"$options": "i",
		}
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
) (databases.Category, error) {

	category, err := s.repository.FindById(ctx, id)
	if err != nil {
		return databases.Category{}, ErrCategoryNotFound
	}

	return category, nil
}

func (s *service) Create(
	ctx context.Context,
	dto CreateCategoryDTO,
) (databases.Category, error) {

	slug := dto.Slug

	if slug == "" {
		slug = strings.ToLower(strings.ReplaceAll(dto.Name, " ", "-"))
	}

	existedCategory, _ := s.repository.FindBySlug(ctx, slug)
	if existedCategory.ID != "" {
		return databases.Category{}, ErrSlugExists
	}

	if dto.ParentID != nil {

		_, err := s.repository.FindById(ctx, *dto.ParentID)
		if err != nil {
			return databases.Category{}, ErrCategoryNotFound
		}
	}

	category := databases.Category{
		Name:     dto.Name,
		Slug:     slug,
		ParentID: dto.ParentID,
	}

	category.BeforeCreate()

	return s.repository.Create(ctx, category)
}

func (s *service) Update(
	ctx context.Context,
	id string,
	dto UpdateCategoryDTO,
) (databases.Category, error) {

	existedCategory, err := s.repository.FindById(ctx, id)
	if err != nil {
		return databases.Category{}, ErrCategoryNotFound
	}

	if dto.Name != nil {
		existedCategory.Name = *dto.Name
	}

	if dto.Slug != nil {
		existedCategory.Slug = *dto.Slug
	}

	if dto.ParentId != nil {

		_, err := s.repository.FindById(ctx, *dto.ParentId)
		if err != nil {
			return databases.Category{}, ErrCategoryNotFound
		}

		existedCategory.ParentID = dto.ParentId
	}

	existedCategory.BeforeUpdate()

	return s.repository.Update(ctx, id, existedCategory)
}

func (s *service) Delete(
	ctx context.Context,
	id string,
) error {

	_, err := s.repository.FindById(ctx, id)
	if err != nil {
		return ErrCategoryNotFound
	}

	return s.repository.Delete(ctx, id)
}