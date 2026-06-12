package inventory

import (
	"context"
	"errors"
	"log"
)

type InventoryEventPublisher interface {
	PublishInventoryUpdated(ctx context.Context, productID string, stock int) error
}

type Service interface {
	GetByProductID(ctx context.Context, productID string) (InventoryResponse, error)
	Create(ctx context.Context, dto CreateInventoryDTO) (InventoryResponse, error)
	Update(ctx context.Context, productID string, dto UpdateInventoryDTO) (InventoryResponse, error)
	ReserveStock(ctx context.Context, productID string, quantity int) error
	ReleaseStock(ctx context.Context, productID string, quantity int) error
}

type service struct {
	repository Repository
	publisher  InventoryEventPublisher
}

func NewService(repository Repository, publishers ...InventoryEventPublisher) Service {
	var pub InventoryEventPublisher
	if len(publishers) > 0 {
		pub = publishers[0]
	}
	return &service{repository: repository, publisher: pub}
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

	if s.publisher != nil {
		go func() {
			if err := s.publisher.PublishInventoryUpdated(context.Background(), productID, updated.Stock); err != nil {
				log.Printf("[inventory] failed to publish inventory.updated for %s: %v", productID, err)
			}
		}()
	}

	return ToResponse(&updated), nil
}

func (s *service) ReserveStock(ctx context.Context, productID string, quantity int) error {
	return s.repository.ReserveStock(ctx, productID, quantity)
}

func (s *service) ReleaseStock(ctx context.Context, productID string, quantity int) error {
	return s.repository.ReleaseStock(ctx, productID, quantity)
}

var ErrInventoryNotFound = errors.New("inventory not found")
