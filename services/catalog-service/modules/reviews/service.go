package review

import (
	"catalog-service/databases"
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type RatingRepository interface {
	UpsertProductRating(ctx context.Context, productID string, average float64, count int, distribution map[int]int) error
	GetProductRating(ctx context.Context, productID string) (databases.ProductRating, error)
}

type Service interface {
	Create(ctx context.Context, userID string, req CreateReviewRequest) (ReviewResponse, error)
	Update(ctx context.Context, userID string, reviewID string, req UpdateReviewRequest) (ReviewResponse, error)
	Delete(ctx context.Context, userID string, reviewID string) error
	GetByProduct(ctx context.Context, productID string, query ReviewQuery) ([]ReviewResponse, int64, error)
	GetByUser(ctx context.Context, userID string, query ReviewQuery) ([]ReviewResponse, int64, error)
	GetByShop(ctx context.Context, shopID string, query ReviewQuery) ([]ReviewResponse, int64, error)
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

func (s *service) Create(ctx context.Context, userID string, req CreateReviewRequest) (ReviewResponse, error) {
	reviews, _, err := s.repository.FindByUser(ctx, userID, 0, 100)
	if err == nil {
		for _, r := range reviews {
			if r.ProductID == req.ProductID && r.DeletedAt == nil {
				return ReviewResponse{}, ErrReviewAlreadyExists
			}
		}
	}

	product, err := s.getProductByID(ctx, req.ProductID)
	if err != nil {
		return ReviewResponse{}, ErrProductNotFound
	}

	review := ProductReview{
		ProductID:    req.ProductID,
		UserID:       userID,
		OrderID:      req.OrderID,
		Rating:       req.Rating,
		Title:        req.Title,
		Comment:      req.Comment,
		ImageURLs:    req.ImageURLs,
		IsVerified:   req.OrderID != "",
		HelpfulCount: 0,
	}
	review.BeforeCreate()

	created, err := s.repository.Create(ctx, review)
	if err != nil {
		return ReviewResponse{}, err
	}

	s.updateProductRating(ctx, req.ProductID)

	return toResponse(&created), nil
}

func (s *service) Update(ctx context.Context, userID string, reviewID string, req UpdateReviewRequest) (ReviewResponse, error) {
	review, err := s.repository.FindByID(ctx, reviewID)
	if err != nil {
		return ReviewResponse{}, ErrReviewNotFound
	}

	if review.UserID != userID {
		return ReviewResponse{}, ErrUnauthorized
	}

	if req.Rating != nil {
		review.Rating = *req.Rating
	}
	if req.Title != nil {
		review.Title = *req.Title
	}
	if req.Comment != nil {
		review.Comment = *req.Comment
	}
	if req.ImageURLs != nil {
		review.ImageURLs = req.ImageURLs
	}

	updated, err := s.repository.Update(ctx, reviewID, review)
	if err != nil {
		return ReviewResponse{}, err
	}

	s.updateProductRating(ctx, review.ProductID)

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

	err = s.repository.Delete(ctx, reviewID)
	if err != nil {
		return err
	}

	s.updateProductRating(ctx, review.ProductID)

	return nil
}

func (s *service) GetByProduct(ctx context.Context, productID string, query ReviewQuery) ([]ReviewResponse, int64, error) {
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.Limit <= 0 || query.Limit > 100 {
		query.Limit = 20
	}

	skip := int64(query.Page-1) * int64(query.Limit)
	limit := int64(query.Limit)

	reviews, total, err := s.repository.FindByProduct(ctx, productID, skip, limit)
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
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.Limit <= 0 || query.Limit > 100 {
		query.Limit = 20
	}

	skip := int64(query.Page-1) * int64(query.Limit)
	limit := int64(query.Limit)

	reviews, total, err := s.repository.FindByUser(ctx, userID, skip, limit)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]ReviewResponse, len(reviews))
	for i, r := range reviews {
		responses[i] = toResponse(&r)
	}

	return responses, total, nil
}

func (s *service) GetByShop(ctx context.Context, shopID string, query ReviewQuery) ([]ReviewResponse, int64, error) {
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.Limit <= 0 || query.Limit > 100 {
		query.Limit = 20
	}

	skip := int64(query.Page-1) * int64(query.Limit)
	limit := int64(query.Limit)

	reviews, total, err := s.repository.FindByShop(ctx, shopID, skip, limit)
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

	reviewCollection := s.productCollection.Database().Collection("reviews")
	_, err = reviewCollection.UpdateOne(ctx,
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

func (s *service) updateProductRating(ctx context.Context, productID string) {
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
		_ = s.ratingRepo.UpsertProductRating(ctx, productID, average, int(count), distribution)
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
	distribution := map[int]int{
		1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
	}

	reviewCollection := s.productCollection.Database().Collection("reviews")
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{
			"product_id": productID,
			"deleted_at": nil,
		}}},
		{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$rating"},
			{Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}},
		}}},
	}

	cursor, err := reviewCollection.Aggregate(ctx, pipeline)
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

func toResponse(review *ProductReview) ReviewResponse {
	return ReviewResponse{
		ID:           review.ID,
		ProductID:    review.ProductID,
		UserID:       review.UserID,
		OrderID:      review.OrderID,
		Rating:       review.Rating,
		Title:        review.Title,
		Comment:      review.Comment,
		ImageURLs:    review.ImageURLs,
		IsVerified:   review.IsVerified,
		HelpfulCount: review.HelpfulCount,
		CreatedAt:    review.CreatedAt,
		UpdatedAt:    review.UpdatedAt,
	}
}

var (
	ErrReviewNotFound      = errors.New("review not found")
	ErrReviewAlreadyExists = errors.New("review already exists for this product")
	ErrProductNotFound     = errors.New("product not found")
	ErrUnauthorized        = errors.New("unauthorized")
)