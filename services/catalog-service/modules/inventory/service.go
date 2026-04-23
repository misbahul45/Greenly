package inventory

import (
	"context"
	"errors"
)

type Service interface {
	GetByProductID(ctx context.Context, productID string) (InventoryResponse, error)
	Create(ctx context.Context, dto CreateInventoryDTO) (InventoryResponse, error)
	Update(ctx context.Context, productID string, dto UpdateInventoryDTO) (InventoryResponse, error)
	ReserveStock(ctx context.Context, productID string, quantity int) error
	ReleaseStock(ctx context.Context, productID string, quantity int) error
}

type service struct {
	repository Repository
}

func NewService(repository Repository) Service {
	return &service{
		repository: repository,
	}
}

func (s *service) GetByProductID(ctx context.Context, productID string) (InventoryResponse, error) {
	inv, err := s.repository.FindByProductID(ctx, productID)
	if err != nil {
		return InventoryResponse{}, err
	}
	return ToResponse(&inv), nil
}

func (s *service) Create(ctx context.Context, dto CreateInventoryDTO) (InventoryResponse, error) {
	inv := Inventory{
		ProductID:         dto.ProductID,
		Stock:             dto.Stock,
		ReservedStock:     0,
		LowStockThreshold: dto.LowStockThreshold,
	}

	created, err := s.repository.Create(ctx, inv)
	if err != nil {
		return InventoryResponse{}, err
	}

	return ToResponse(&created), nil
}

func (s *service) Update(ctx context.Context, productID string, dto UpdateInventoryDTO) (InventoryResponse, error) {
	existing, err := s.repository.FindByProductID(ctx, productID)
	if err != nil {
		return InventoryResponse{}, err
	}

	if dto.Stock != nil {
		existing.Stock = *dto.Stock
	}
	if dto.LowStockThreshold != nil {
		existing.LowStockThreshold = *dto.LowStockThreshold
	}

	updated, err := s.repository.Update(ctx, productID, existing)
	if err != nil {
		return InventoryResponse{}, err
	}

	return ToResponse(&updated), nil
}

func (s *service) ReserveStock(ctx context.Context, productID string, quantity int) error {
	err := s.repository.ReserveStock(ctx, productID, quantity)
	if err != nil {
		return err
	}
	return nil
}

func (s *service) ReleaseStock(ctx context.Context, productID string, quantity int) error {
	err := s.repository.ReleaseStock(ctx, productID, quantity)
	if err != nil {
		return err
	}
	return nil
}

var ErrInventoryNotFound = errors.New("inventory not found")