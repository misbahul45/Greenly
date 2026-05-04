package review

import (
	"catalog-service/databases"
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type RatingRepository interface {
	UpsertProductRating(ctx context.Context, productID string, average float64, count int, distribution map[int]int) error
}

type Service interface {
	Create(ctx context.Context, userID string, dto CreateReviewRequest) (ReviewResponse, error)
	Update(ctx context.Context, userID string, reviewID string, dto UpdateReviewRequest) (ReviewResponse, error)
	Delete(ctx context.Context, userID string, reviewID string) error
	GetByProduct(ctx context.Context, productID string, query ReviewQuery) ([]ReviewResponse, int64, error)
	GetByUser(ctx context.Context, userID string, query ReviewQuery) ([]ReviewResponse, int64, error)
	GetByID(ctx context.Context, reviewID string) (ReviewResponse, error)
	MarkHelpful(ctx context.Context, reviewID string) error
}

type service struct {
	repository        Repository
	ratingRepo        RatingRepository
	productCollection *mongo.Collection
}

func NewService(repository Repository, ratingRepo RatingRepository, productCollection *mongo.Collection) Service {
	return &service{
		repository:        repository,
		ratingRepo:        ratingRepo,
		productCollection: productCollection,
	}
}

func (s *service) Create(ctx context.Context, userID string, dto CreateReviewRequest) (ReviewResponse, error) {
	_, err := s.getProductByID(ctx, dto.ProductID)
	if err != nil {
		return ReviewResponse{}, ErrProductNotFound
	}

	reviews, _, _ := s.repository.FindByUser(ctx, userID, 0, 200)
	for _, r := range reviews {
		if r.ProductID == dto.ProductID && r.DeletedAt == nil {
			return ReviewResponse{}, ErrReviewAlreadyExists
		}
	}

	review := ProductReview{
		ProductID:    dto.ProductID,
		UserID:       userID,
		OrderID:      dto.OrderID,
		Rating:       dto.Rating,
		Title:        dto.Title,
		Comment:      dto.Comment,
		ImageURLs:    dto.ImageURLs,
		IsVerified:   dto.OrderID != "",
		HelpfulCount: 0,
	}
	review.BeforeCreate()

	created, err := s.repository.Create(ctx, review)
	if err != nil {
		return ReviewResponse{}, err
	}

	s.recalculateRating(ctx, dto.ProductID)

	return toResponse(&created), nil
}

func (s *service) Update(ctx context.Context, userID string, reviewID string, dto UpdateReviewRequest) (ReviewResponse, error) {
	review, err := s.repository.FindByID(ctx, reviewID)
	if err != nil {
		return ReviewResponse{}, ErrReviewNotFound
	}

	if review.UserID != userID {
		return ReviewResponse{}, ErrUnauthorized
	}

	if dto.Rating != nil {
		review.Rating = *dto.Rating
	}
	if dto.Title != nil {
		review.Title = *dto.Title
	}
	if dto.Comment != nil {
		review.Comment = *dto.Comment
	}
	if dto.ImageURLs != nil {
		review.ImageURLs = dto.ImageURLs
	}

	updated, err := s.repository.Update(ctx, reviewID, review)
	if err != nil {
		return ReviewResponse{}, err
	}

	s.recalculateRating(ctx, review.ProductID)

	return toResponse(&updated), nil
}

func (s *service) Delete(ctx context.Context, userID string, reviewID string) error {
	review, err := s.repository.FindByID(ctx, reviewID)
	if err != nil {
		return ErrReviewNotFound
	}

	if review.UserID != userID {
		return ErrUnauthorized
	}

	if err := s.repository.Delete(ctx, reviewID); err != nil {
		return err
	}

	s.recalculateRating(ctx, review.ProductID)

	return nil
}

func (s *service) GetByProduct(ctx context.Context, productID string, query ReviewQuery) ([]ReviewResponse, int64, error) {
	skip := int64(query.Page-1) * int64(query.Limit)
	reviews, total, err := s.repository.FindByProduct(ctx, productID, skip, int64(query.Limit))
	if err != nil {
		return nil, 0, err
	}

	responses := make([]ReviewResponse, len(reviews))
	for i, r := range reviews {
		responses[i] = toResponse(&r)
	}
	return responses, total, nil
}

func (s *service) GetByUser(ctx context.Context, userID string, query ReviewQuery) ([]ReviewResponse, int64, error) {
	skip := int64(query.Page-1) * int64(query.Limit)
	reviews, total, err := s.repository.FindByUser(ctx, userID, skip, int64(query.Limit))
	if err != nil {
		return nil, 0, err
	}

	responses := make([]ReviewResponse, len(reviews))
	for i, r := range reviews {
		responses[i] = toResponse(&r)
	}
	return responses, total, nil
}

func (s *service) GetByID(ctx context.Context, reviewID string) (ReviewResponse, error) {
	review, err := s.repository.FindByID(ctx, reviewID)
	if err != nil {
		return ReviewResponse{}, ErrReviewNotFound
	}
	return toResponse(&review), nil
}

func (s *service) MarkHelpful(ctx context.Context, reviewID string) error {
	_, err := s.repository.FindByID(ctx, reviewID)
	if err != nil {
		return ErrReviewNotFound
	}

	reviewCol := s.productCollection.Database().Collection("product_reviews")
	_, err = reviewCol.UpdateOne(ctx,
		bson.M{"_id": reviewID},
		bson.M{"$inc": bson.M{"helpful_count": 1}},
	)
	return err
}

func (s *service) getProductByID(ctx context.Context, productID string) (databases.Product, error) {
	var product databases.Product
	err := s.productCollection.FindOne(ctx, bson.M{
		"_id":        productID,
		"deleted_at": nil,
	}).Decode(&product)
	return product, err
}

func (s *service) recalculateRating(ctx context.Context, productID string) {
	count, err := s.repository.GetReviewCount(ctx, productID)
	if err != nil {
		return
	}

	average, err := s.repository.GetAverageRating(ctx, productID)
	if err != nil {
		return
	}

	distribution := s.getRatingDistribution(ctx, productID)

	if s.ratingRepo != nil {
		s.ratingRepo.UpsertProductRating(ctx, productID, average, int(count), distribution)
	}

	s.productCollection.UpdateOne(ctx,
		bson.M{"_id": productID},
		bson.M{"$set": bson.M{
			"rating_average": average,
			"review_count":   count,
			"updated_at":     time.Now(),
		}},
	)
}

func (s *service) getRatingDistribution(ctx context.Context, productID string) map[int]int {
	distribution := map[int]int{1: 0, 2: 0, 3: 0, 4: 0, 5: 0}

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"product_id": productID, "deleted_at": nil}}},
		{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$rating"},
			{Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}},
		}}},
	}

	reviewCol := s.productCollection.Database().Collection("product_reviews")
	cursor, err := reviewCol.Aggregate(ctx, pipeline)
	if err != nil {
		return distribution
	}
	defer cursor.Close(ctx)

	var results []struct {
		Rating int `bson:"_id"`
		Count  int `bson:"count"`
	}
	if err := cursor.All(ctx, &results); err != nil {
		return distribution
	}

	for _, r := range results {
		if r.Rating >= 1 && r.Rating <= 5 {
			distribution[r.Rating] = r.Count
		}
	}
	return distribution
}

func toResponse(r *ProductReview) ReviewResponse {
	return ReviewResponse{
		ID:           r.ID,
		ProductID:    r.ProductID,
		UserID:       r.UserID,
		OrderID:      r.OrderID,
		Rating:       r.Rating,
		Title:        r.Title,
		Comment:      r.Comment,
		ImageURLs:    r.ImageURLs,
		IsVerified:   r.IsVerified,
		HelpfulCount: r.HelpfulCount,
		CreatedAt:    r.CreatedAt,
		UpdatedAt:    r.UpdatedAt,
	}
}

var (
	ErrReviewNotFound      = errors.New("review not found")
	ErrReviewAlreadyExists = errors.New("review already exists for this product")
	ErrProductNotFound     = errors.New("product not found")
	ErrUnauthorized        = errors.New("unauthorized")
)
