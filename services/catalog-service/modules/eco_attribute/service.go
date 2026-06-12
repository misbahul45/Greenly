package ecoattribute

import (
	"context"
	"errors"
	"log"
)

var ErrEcoAttributeNotFound = errors.New("eco attribute not found")

type EcoAttrEventPublisher interface {
	PublishEcoAttributeUpdated(ctx context.Context, productID string, ecoScore float64, materialType string, recyclable bool, carbonFootprint float64) error
}

type Service interface {
	GetByProductID(ctx context.Context, productID string) (EcoAttributeResponse, error)
	Create(ctx context.Context, dto CreateEcoAttributeDTO) (EcoAttributeResponse, error)
	Update(ctx context.Context, productID string, dto UpdateEcoAttributeDTO) (EcoAttributeResponse, error)
	Delete(ctx context.Context, productID string) error
}

type service struct {
	repository Repository
	publisher  EcoAttrEventPublisher
}

func NewService(repository Repository, publishers ...EcoAttrEventPublisher) Service {
	var pub EcoAttrEventPublisher
	if len(publishers) > 0 {
		pub = publishers[0]
	}
	return &service{repository: repository, publisher: pub}
}

func (s *service) GetByProductID(ctx context.Context, productID string) (EcoAttributeResponse, error) {
	eco, err := s.repository.FindByProductID(ctx, productID)
	if err != nil {
		return EcoAttributeResponse{}, ErrEcoAttributeNotFound
	}
	return ToResponse(&eco), nil
}

func (s *service) Create(ctx context.Context, dto CreateEcoAttributeDTO) (EcoAttributeResponse, error) {
	eco := EcoAttribute{
		ProductID:       dto.ProductID,
		CarbonFootprint: dto.CarbonFootprint,
		Recyclable:      dto.Recyclable,
		MaterialType:    dto.MaterialType,
		EcoScore:        dto.EcoScore,
	}

	created, err := s.repository.Create(ctx, eco)
	if err != nil {
		return EcoAttributeResponse{}, err
	}

	if s.publisher != nil {
		go func() {
			if err := s.publisher.PublishEcoAttributeUpdated(context.Background(), created.ProductID, created.EcoScore, created.MaterialType, created.Recyclable, created.CarbonFootprint); err != nil {
				log.Printf("[eco_attribute] failed to publish eco_attribute.updated for %s: %v", created.ProductID, err)
			}
		}()
	}

	return ToResponse(&created), nil
}

func (s *service) Update(ctx context.Context, productID string, dto UpdateEcoAttributeDTO) (EcoAttributeResponse, error) {
	existing, err := s.repository.FindByProductID(ctx, productID)
	if err != nil {
		return EcoAttributeResponse{}, ErrEcoAttributeNotFound
	}

	if dto.CarbonFootprint != nil {
		existing.CarbonFootprint = *dto.CarbonFootprint
	}
	if dto.Recyclable != nil {
		existing.Recyclable = *dto.Recyclable
	}
	if dto.MaterialType != nil {
		existing.MaterialType = *dto.MaterialType
	}
	if dto.EcoScore != nil {
		existing.EcoScore = *dto.EcoScore
	}

	updated, err := s.repository.Update(ctx, productID, existing)
	if err != nil {
		return EcoAttributeResponse{}, err
	}

	if s.publisher != nil {
		go func() {
			if err := s.publisher.PublishEcoAttributeUpdated(context.Background(), updated.ProductID, updated.EcoScore, updated.MaterialType, updated.Recyclable, updated.CarbonFootprint); err != nil {
				log.Printf("[eco_attribute] failed to publish eco_attribute.updated for %s: %v", updated.ProductID, err)
			}
		}()
	}

	return ToResponse(&updated), nil
}

func (s *service) Delete(ctx context.Context, productID string) error {
	_, err := s.repository.FindByProductID(ctx, productID)
	if err != nil {
		return ErrEcoAttributeNotFound
	}
	return s.repository.Delete(ctx, productID)
}
