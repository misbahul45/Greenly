package productdiscount

import (
	"context"
	"errors"
)

type Service interface {
	GetByProductID(ctx context.Context, productID string) ([]ProductDiscountResponse, error)
	Create(ctx context.Context, dto CreateDiscountDTO) (ProductDiscount, error)
	Update(ctx context.Context, id string, dto UpdateDiscountDTO) (ProductDiscount, error)
	Delete(ctx context.Context, id string) error
}

type service struct {
	repository Repository
}

func NewService(repository Repository) Service {
	return &service{repository: repository}
}

func (s *service) GetByProductID(ctx context.Context, productID string) ([]ProductDiscountResponse, error) {
	discounts, err := s.repository.FindByProductID(ctx, productID)
	if err != nil {
		return nil, err
	}
	responses := make([]ProductDiscountResponse, len(discounts))
	for i, d := range discounts {
		responses[i] = ToResponse(&d)
	}
	return responses, nil
}

func (s *service) Create(ctx context.Context, dto CreateDiscountDTO) (ProductDiscount, error) {
	discount := ProductDiscount{
		ProductID:  dto.ProductID,
		Name:       dto.Name,
		Percentage: dto.Percentage,
		FixedAmount: dto.FixedAmount,
		ValidFrom:  dto.ValidFrom,
		ValidTo:    dto.ValidTo,
		IsActive:   true,
	}
	return s.repository.Create(ctx, discount)
}

func (s *service) Update(ctx context.Context, id string, dto UpdateDiscountDTO) (ProductDiscount, error) {
	existing, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return ProductDiscount{}, ErrDiscountNotFound
	}
	if dto.Name != nil {
		existing.Name = *dto.Name
	}
	if dto.Percentage != nil {
		existing.Percentage = *dto.Percentage
	}
	if dto.FixedAmount != nil {
		existing.FixedAmount = *dto.FixedAmount
	}
	if dto.ValidFrom != nil {
		existing.ValidFrom = *dto.ValidFrom
	}
	if dto.ValidTo != nil {
		existing.ValidTo = *dto.ValidTo
	}
	if dto.IsActive != nil {
		existing.IsActive = *dto.IsActive
	}
	return s.repository.Update(ctx, id, existing)
}

func (s *service) Delete(ctx context.Context, id string) error {
	return s.repository.Delete(ctx, id)
}

var ErrDiscountNotFound = errors.New("discount not found")