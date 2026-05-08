package review

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Repository interface {
	FindByID(ctx context.Context, id string) (ProductReview, error)
	FindByProduct(ctx context.Context, productID string, skip, limit int64) ([]ProductReview, int64, error)
	FindByUser(ctx context.Context, userID string, skip, limit int64) ([]ProductReview, int64, error)
	Create(ctx context.Context, review ProductReview) (ProductReview, error)
	Update(ctx context.Context, id string, review ProductReview) (ProductReview, error)
	Delete(ctx context.Context, id string) error
	GetReviewCount(ctx context.Context, productID string) (int64, error)
	GetAverageRating(ctx context.Context, productID string) (float64, error)
}

type repository struct {
	collection        *mongo.Collection
	productCollection *mongo.Collection
}

func NewRepository(db *mongo.Database) Repository {
	return &repository{
		collection:        db.Collection("product_reviews"),
		productCollection: db.Collection("products"),
	}
}

func (r *repository) FindByID(ctx context.Context, id string) (ProductReview, error) {
	var review ProductReview
	err := r.collection.FindOne(ctx, bson.M{"_id": id, "deleted_at": nil}).Decode(&review)
	return review, err
}

func (r *repository) FindByProduct(ctx context.Context, productID string, skip, limit int64) ([]ProductReview, int64, error) {
	filter := bson.M{"product_id": productID, "deleted_at": nil}

	cursor, err := r.collection.Find(ctx, filter, options.Find().
		SetSkip(skip).SetLimit(limit).
		SetSort(bson.D{{Key: "created_at", Value: -1}}))
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var reviews []ProductReview
	if err := cursor.All(ctx, &reviews); err != nil {
		return nil, 0, err
	}

	count, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}
	return reviews, count, nil
}

func (r *repository) FindByUser(ctx context.Context, userID string, skip, limit int64) ([]ProductReview, int64, error) {
	filter := bson.M{"user_id": userID, "deleted_at": nil}

	cursor, err := r.collection.Find(ctx, filter, options.Find().
		SetSkip(skip).SetLimit(limit).
		SetSort(bson.D{{Key: "created_at", Value: -1}}))
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var reviews []ProductReview
	if err := cursor.All(ctx, &reviews); err != nil {
		return nil, 0, err
	}

	count, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}
	return reviews, count, nil
}

func (r *repository) Create(ctx context.Context, review ProductReview) (ProductReview, error) {
	review.BeforeCreate()
	_, err := r.collection.InsertOne(ctx, review)
	if err != nil {
		return review, err
	}

	r.productCollection.UpdateOne(ctx,
		bson.M{"_id": review.ProductID},
		bson.M{"$inc": bson.M{"review_count": 1}},
	)
	return review, nil
}

func (r *repository) Update(ctx context.Context, id string, review ProductReview) (ProductReview, error) {
	review.BeforeUpdate()
	update := bson.M{"$set": bson.M{
		"rating":     review.Rating,
		"title":      review.Title,
		"comment":    review.Comment,
		"image_urls": review.ImageURLs,
		"updated_at": review.UpdatedAt,
	}}
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id, "deleted_at": nil}, update)
	return review, err
}

func (r *repository) Delete(ctx context.Context, id string) error {
	review, err := r.FindByID(ctx, id)
	if err != nil {
		return err
	}

	_, err = r.collection.UpdateOne(ctx,
		bson.M{"_id": id, "deleted_at": nil},
		bson.M{"$set": bson.M{"deleted_at": time.Now()}},
	)
	if err != nil {
		return err
	}

	r.productCollection.UpdateOne(ctx,
		bson.M{"_id": review.ProductID},
		bson.M{"$inc": bson.M{"review_count": -1}},
	)
	return nil
}

func (r *repository) GetReviewCount(ctx context.Context, productID string) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{"product_id": productID, "deleted_at": nil})
}

func (r *repository) GetAverageRating(ctx context.Context, productID string) (float64, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"product_id": productID, "deleted_at": nil}}},
		{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: nil},
			{Key: "avg", Value: bson.D{{Key: "$avg", Value: "$rating"}}},
		}}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return 0, err
	}
	defer cursor.Close(ctx)

	var result []struct {
		Avg float64 `bson:"avg"`
	}
	if err := cursor.All(ctx, &result); err != nil || len(result) == 0 {
		return 0, err
	}
	return result[0].Avg, nil
}
