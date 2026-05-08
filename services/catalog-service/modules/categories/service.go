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
	FindCategoryTree(ctx context.Context, query CategoryTreeQuery) (CategoryTreeResponse, error)
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

func (s *service) FindMany(ctx context.Context, query CategoryQuery) ([]databases.Category, int64, error) {
	filter := bson.M{}

	if query.Search != "" {
		filter["name"] = bson.M{
			"$regex":   query.Search,
			"$options": "i",
		}
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

func (s *service) FindOne(ctx context.Context, id string) (databases.Category, error) {
	category, err := s.repository.FindById(ctx, id)
	if err != nil {
		return databases.Category{}, ErrCategoryNotFound
	}
	return category, nil
}

func (s *service) Create(ctx context.Context, dto CreateCategoryDTO) (databases.Category, error) {
	slug := dto.Slug

	if slug == "" {
		slug = strings.ToLower(strings.TrimSpace(dto.Name))
		slug = strings.ReplaceAll(slug, " ", "-")
	}

	existedCategory, err := s.repository.FindBySlug(ctx, slug)
	if err == nil && existedCategory.ID != "" {
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

func (s *service) Update(ctx context.Context, id string, dto UpdateCategoryDTO) (databases.Category, error) {
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

func (s *service) Delete(ctx context.Context, id string) error {
	_, err := s.repository.FindById(ctx, id)
	if err != nil {
		return ErrCategoryNotFound
	}
	return s.repository.Delete(ctx, id)
}

func (s *service) FindCategoryTree(ctx context.Context, query CategoryTreeQuery) (CategoryTreeResponse, error) {
	filter := bson.M{"deleted_at": bson.M{"$eq": nil}}

	if query.OnlyActive {
		filter["is_active"] = true
	}

	if query.ParentID != "" {
		filter["parent_id"] = query.ParentID
	} else {
		filter["$or"] = []bson.M{
			{"parent_id": bson.M{"$exists": false}},
			{"parent_id": nil},
		}
	}

	opts := options.Find().SetSort(bson.D{
		{Key: "order", Value: 1},
		{Key: "name", Value: 1},
	})

	categories, total, err := s.repository.FindMany(ctx, filter, opts)
	if err != nil {
		return CategoryTreeResponse{}, err
	}

	catMap := make(map[string]*CategoryTreeNode)

	for i := range categories {
		cat := &categories[i]

		node := &CategoryTreeNode{
			ID:        cat.ID,
			Name:      cat.Name,
			Slug:      cat.Slug,
			ParentID:  cat.ParentID,
			Level:     0,
			CreatedAt: cat.CreatedAt,
			UpdatedAt: cat.UpdatedAt,
		}

		if query.IncludeProducts {
			count, _ := s.repository.CountProductByCategory(ctx, cat.ID)
			node.ProductCount = count
		}

		if query.WithPath {
			node.Path = []string{cat.Name}
		}

		catMap[cat.ID] = node
	}

	var roots []CategoryTreeNode

	for _, cat := range categories {
		node := catMap[cat.ID]

		if cat.ParentID == nil || *cat.ParentID == "" {
			roots = append(roots, *node)
		} else if parent, ok := catMap[*cat.ParentID]; ok {
			node.Level = parent.Level + 1
			if query.WithPath {
				node.Path = append(append([]string{}, parent.Path...), cat.Name)
			}
			parent.Children = append(parent.Children, *node)
		}
	}

	if query.MaxDepth != nil {
		roots = trimByDepth(roots, 0, *query.MaxDepth)
	}

	return CategoryTreeResponse{
		Data: roots,
		Meta: TreeMeta{
			TotalCategories: total,
			RootID:          query.ParentID,
			Format:          query.Format,
			MaxDepthReached: query.MaxDepth,
		},
	}, nil
}

func trimByDepth(nodes []CategoryTreeNode, current, max int) []CategoryTreeNode {
	if current >= max {
		for i := range nodes {
			nodes[i].Children = []CategoryTreeNode{}
		}
		return nodes
	}

	for i := range nodes {
		nodes[i].Children = trimByDepth(nodes[i].Children, current+1, max)
	}

	return nodes
}