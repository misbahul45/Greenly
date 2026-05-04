package productrating

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Repository interface {
	FindByProductID(ctx context.Context, productID string) (ProductRating, error)
	FindMany(ctx context.Context, filter bson.M, opts *options.FindOptions) ([]ProductRating, int64, error)
	Upsert(ctx context.Context, productID string, rating ProductRating) (ProductRating, error)
	Delete(ctx context.Context, productID string) error
}

type repository struct {
	collection *mongo.Collection
}

func NewRepository(db *mongo.Database) Repository {
	return &repository{
		collection: db.Collection("product_ratings"),
	}
}

func (r *repository) FindByProductID(ctx context.Context, productID string) (ProductRating, error) {
	var rating ProductRating
	err := r.collection.FindOne(ctx, bson.M{"product_id": productID}).Decode(&rating)
	return rating, err
}

func (r *repository) FindMany(ctx context.Context, filter bson.M, opts *options.FindOptions) ([]ProductRating, int64, error) {
	if filter == nil {
		filter = bson.M{}
	}

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var ratings []ProductRating
	if err := cursor.All(ctx, &ratings); err != nil {
		return nil, 0, err
	}

	count, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return 0, 0, err
	}

	return ratings, count, nil
}

func (r *repository) Upsert(ctx context.Context, productID string, rating ProductRating) (ProductRating, error) {
	rating.ProductID = productID
	rating.UpdatedAt = time.Now()

	filter := bson.M{"product_id": productID}
	update := bson.M{"$set": bson.M{
		"average":    rating.Average,
		"count":      rating.Count,
		"one_star":   rating.OneStar,
		"two_star":   rating.TwoStar,
		"three_star": rating.ThreeStar,
		"four_star":  rating.FourStar,
		"five_star":  rating.FiveStar,
		"updated_at": rating.UpdatedAt,
	}}

	opts := options.FindOneAndUpdate().SetUpsert(true)
	var result ProductRating
	err := r.collection.FindOneAndUpdate(ctx, filter, update, opts).Decode(&result)
	if err != nil {
		return rating, err
	}

	result.ProductID = productID
	result.Average = rating.Average
	result.Count = rating.Count
	result.OneStar = rating.OneStar
	result.TwoStar = rating.TwoStar
	result.ThreeStar = rating.ThreeStar
	result.FourStar = rating.FourStar
	result.FiveStar = rating.FiveStar
	result.UpdatedAt = rating.UpdatedAt

	return result, nil
}

func (r *repository) Delete(ctx context.Context, productID string) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"product_id": productID})
	return err
}