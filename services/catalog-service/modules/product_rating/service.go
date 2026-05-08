package productrating

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Service interface {
	GetByProductID(ctx context.Context, productID string) (ProductRatingResponse, error)
	GetProductsRatings(ctx context.Context, productIDs []string) ([]ProductRatingResponse, error)
	GetTopRatedProducts(ctx context.Context, limit int) ([]ProductRatingResponse, error)
}

type service struct {
	repository Repository
}

func NewService(repository Repository) Service {
	return &service{
		repository: repository,
	}
}

func (s *service) GetByProductID(ctx context.Context, productID string) (ProductRatingResponse, error) {
	rating, err := s.repository.FindByProductID(ctx, productID)
	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			return ProductRatingResponse{
				ProductID: productID,
				Average:   0,
				Count:     0,
				UpdatedAt: time.Now(),
			}, nil
		}
		return ProductRatingResponse{}, err
	}
	return toResponse(&rating), nil
}

func (s *service) GetProductsRatings(ctx context.Context, productIDs []string) ([]ProductRatingResponse, error) {
	if len(productIDs) == 0 {
		return []ProductRatingResponse{}, nil
	}

	filter := bson.M{"product_id": bson.M{"$in": productIDs}}
	ratings, _, err := s.repository.FindMany(ctx, filter, options.Find())
	if err != nil {
		return nil, err
	}

	result := make([]ProductRatingResponse, len(productIDs))
	for i, id := range productIDs {
		result[i] = ProductRatingResponse{
			ProductID: id,
			Average:   0,
			Count:     0,
		}
	}

	for _, r := range ratings {
		for i, id := range productIDs {
			if r.ProductID == id {
				result[i] = toResponse(&r)
				break
			}
		}
	}

	return result, nil
}

func (s *service) GetTopRatedProducts(ctx context.Context, limit int) ([]ProductRatingResponse, error) {
	if limit <= 0 {
		limit = 10
	}

	filter := bson.M{"count": bson.M{"$gt": 0}}
	opts := options.Find().SetLimit(int64(limit)).SetSort(bson.D{{Key: "average", Value: -1}})

	ratings, _, err := s.repository.FindMany(ctx, filter, opts)
	if err != nil {
		return nil, err
	}

	responses := make([]ProductRatingResponse, len(ratings))
	for i, r := range ratings {
		responses[i] = toResponse(&r)
	}

	return responses, nil
}

func toResponse(rating *ProductRating) ProductRatingResponse {
	return ProductRatingResponse{
		ProductID: rating.ProductID,
		Average:   rating.Average,
		Count:     rating.Count,
		OneStar:   rating.OneStar,
		TwoStar:   rating.TwoStar,
		ThreeStar: rating.ThreeStar,
		FourStar:  rating.FourStar,
		FiveStar:  rating.FiveStar,
		UpdatedAt: rating.UpdatedAt,
	}
}

var ErrRatingNotFound = errors.New("rating not found")