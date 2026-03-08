package product

import (
	"catalog-service/databases"
	"context"
)

type ProductService interface {
	FindMany(query ProductQuery) (FindManyProductsResponse, int64, error)
	FindOne(id string) (ResponseProduct, error)
	Create(product CreateProductDTO) (ResponseProduct, error)
	Update(id string, product UpdateProductDTO) (ResponseProduct, error)
	Delete(id string) error
}

type productService struct {
	repo ProductRepository
}

func NewProductService(repo ProductRepository) ProductService {
	return &productService{
		repo: repo,
	}
}

func (s *productService) FindMany(query ProductQuery) (FindManyProductsResponse, int64, error) {

	products, total, err := s.repo.FindMany(context.Background(), query)
	if err != nil {
		return FindManyProductsResponse{}, 0, err
	}

	res := FindManyProductsResponse{
		Items: []ResponseProduct{},
	}

	for _, p := range products {
		res.Items = append(res.Items, ResponseProduct{
			ID:          p.ID,
			Name:        p.Name,
			Description: p.Description,
			SKU:         p.SKU,
			IsActive:    p.IsActive,
			CreatedAt:   p.CreatedAt,
			UpdatedAt:   p.UpdatedAt,
		})
	}

	return res, total, nil
}

func (s *productService) FindOne(id string) (ResponseProduct, error) {

	product, err := s.repo.FindOne(context.Background(), id)
	if err != nil {
		return ResponseProduct{}, err
	}

	return ResponseProduct{
		ID:          product.ID,
		Name:        product.Name,
		Description: product.Description,
		SKU:         product.SKU,
		IsActive:    product.IsActive,
		CreatedAt:   product.CreatedAt,
		UpdatedAt:   product.UpdatedAt,
	}, nil
}

func (s *productService) Create(dto CreateProductDTO) (ResponseProduct, error) {

	model := databases.Product{
		Name:        dto.Name,
		Description: dto.Description,
		SKU:         dto.SKU,
		IsActive:    dto.IsActive,
	}

	product, err := s.repo.Create(context.Background(), model)
	if err != nil {
		return ResponseProduct{}, err
	}

	return ResponseProduct{
		ID:   product.ID,
		Name: product.Name,
		SKU:  product.SKU,
	}, nil
}

func (s *productService) Update(id string, dto UpdateProductDTO) (ResponseProduct, error) {

	model := databases.Product{
		Name:        dto.Name,
		Description: dto.Description,
		SKU:         dto.SKU,
		IsActive:    dto.IsActive,
	}

	product, err := s.repo.Update(context.Background(), id, model)
	if err != nil {
		return ResponseProduct{}, err
	}

	return ResponseProduct{
		ID:   product.ID,
		Name: product.Name,
		SKU:  product.SKU,
	}, nil
}

func (s *productService) Delete(id string) error {
	return s.repo.Delete(context.Background(), id)
}