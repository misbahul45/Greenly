package price

import (
	"context"
	"errors"
)

type Service interface {
	GetByProductID(ctx context.Context, productID string) (PriceResponse, error)
	Create(ctx context.Context, dto CreatePriceDTO) (Price, error)
	Update(ctx context.Context, productID string, dto UpdatePriceDTO) (Price, error)
}

type service struct {
	repository Repository
}

func NewService(repository Repository) Service {
	return &service{
		repository: repository,
	}
}

func (s *service) GetByProductID(ctx context.Context, productID string) (PriceResponse, error) {
	price, err := s.repository.FindByProductID(ctx, productID)
	if err != nil {
		return PriceResponse{}, ErrPriceNotFound
	}
	return ToResponse(&price), nil
}

func (s *service) Create(ctx context.Context, dto CreatePriceDTO) (Price, error) {
	if dto.Currency == "" {
		dto.Currency = "IDR"
	}

	price := Price{
		ProductID: dto.ProductID,
		Amount:    dto.Amount,
		Currency:  dto.Currency,
	}

	created, err := s.repository.Create(ctx, price)
	if err != nil {
		return Price{}, err
	}

	return created, nil
}

func (s *service) Update(ctx context.Context, productID string, dto UpdatePriceDTO) (Price, error) {
	existing, err := s.repository.FindByProductID(ctx, productID)
	if err != nil {
		return Price{}, ErrPriceNotFound
	}

	if dto.Amount != nil {
		existing.Amount = *dto.Amount
	}
	if dto.Currency != nil {
		existing.Currency = *dto.Currency
	}

	updated, err := s.repository.Update(ctx, productID, existing)
	if err != nil {
		return Price{}, err
	}

	return updated, nil
}

var ErrPriceNotFound = errors.New("price not found")