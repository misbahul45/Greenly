package activeprice

import (
	"context"
	"errors"
)

type PriceInfo struct {
	ID        string  `bson:"_id,omitempty" json:"id"`
	ProductID string  `bson:"product_id" json:"productId"`
	Amount   float64 `bson:"amount" json:"amount"`
	Currency string  `bson:"currency" json:"currency"`
}

type Service interface {
	GetByProductID(ctx context.Context, productID string) (ActivePriceResponse, error)
	Recalculate(ctx context.Context, productID string) error
	RecalculateForAllProducts(ctx context.Context) error
}

type service struct {
	repository      Repository
	priceRepository PriceRepository
}

func NewService(repository Repository, priceRepository PriceRepository) Service {
	return &service{
		repository:      repository,
		priceRepository: priceRepository,
	}
}

func (s *service) GetByProductID(ctx context.Context, productID string) (ActivePriceResponse, error) {
	activePrice, err := s.repository.FindByProductID(ctx, productID)
	if err != nil {
		return ActivePriceResponse{}, ErrActivePriceNotFound
	}
	return ToResponse(&activePrice), nil
}

func (s *service) Recalculate(ctx context.Context, productID string) error {
	price, err := s.priceRepository.FindByProductID(ctx, productID)
	if err != nil {
		return err
	}

	discountAmount := s.calculateDiscount(ctx, productID)
	finalPrice := price.Amount - discountAmount

	activePrice := ActivePrice{
		ProductID:  productID,
		FinalPrice: finalPrice,
	}

	existing, err := s.repository.FindByProductID(ctx, productID)
	if err == nil {
		activePrice.ID = existing.ID
		_, err = s.repository.Update(ctx, productID, activePrice)
	} else {
		_, err = s.repository.Create(ctx, activePrice)
	}

	return err
}

func (s *service) RecalculateForAllProducts(ctx context.Context) error {
	return nil
}

func (s *service) calculateDiscount(ctx context.Context, productID string) float64 {
	return 0
}

var ErrActivePriceNotFound = errors.New("active price not found")

type PriceRepository interface {
	FindByProductID(ctx context.Context, productID string) (PriceInfo, error)
}