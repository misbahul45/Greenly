package favorite

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Repository interface {
	FindByUserAndProduct(ctx context.Context, userID, productID string) (Favorite, error)
	FindByUser(ctx context.Context, userID string, skip, limit int64) ([]Favorite, int64, error)
	FindByProduct(ctx context.Context, productID string) ([]Favorite, error)
	Create(ctx context.Context, favorite Favorite) (Favorite, error)
	Delete(ctx context.Context, userID, productID string) error
	CountByUser(ctx context.Context, userID string) (int64, error)
}

type repository struct {
	collection    *mongo.Collection
	productCollection *mongo.Collection
}

func NewRepository(db *mongo.Database) Repository {
	return &repository{
		collection:    db.Collection("favorites"),
		productCollection: db.Collection("products"),
	}
}

func (r *repository) FindByUserAndProduct(ctx context.Context, userID, productID string) (Favorite, error) {
	var favorite Favorite
	err := r.collection.FindOne(ctx, bson.M{
		"user_id":    userID,
		"product_id": productID,
		"deleted_at": nil,
	}).Decode(&favorite)
	return favorite, err
}

func (r *repository) FindByUser(ctx context.Context, userID string, skip, limit int64) ([]Favorite, int64, error) {
	filter := bson.M{
		"user_id":    userID,
		"deleted_at": nil,
	}

	cursor, err := r.collection.Find(ctx, filter, options.Find().SetSkip(skip).SetLimit(limit).SetSort(bson.D{{Key: "created_at", Value: -1}}))
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var favorites []Favorite
	if err := cursor.All(ctx, &favorites); err != nil {
		return nil, 0, err
	}

	count, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return 0, 0, err
	}

	return favorites, count, nil
}

func (r *repository) FindByProduct(ctx context.Context, productID string) ([]Favorite, error) {
	cursor, err := r.collection.Find(ctx, bson.M{
		"product_id": productID,
		"deleted_at": nil,
	})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var favorites []Favorite
	if err := cursor.All(ctx, &favorites); err != nil {
		return nil, err
	}
	return favorites, nil
}

func (r *repository) Create(ctx context.Context, favorite Favorite) (Favorite, error) {
	favorite.BeforeCreate()
	_, err := r.collection.InsertOne(ctx, favorite)
	if err != nil {
		return favorite, err
	}

	_, err = r.productCollection.UpdateOne(ctx, 
		bson.M{"_id": favorite.ProductID},
		bson.M{"$inc": bson.M{"favorite_count": 1}},
	)
	if err != nil {
		return favorite, err
	}

	return favorite, nil
}

func (r *repository) Delete(ctx context.Context, userID, productID string) error {
	now := time.Now()
	result, err := r.collection.UpdateOne(ctx, 
		bson.M{
			"user_id":    userID,
			"product_id": productID,
			"deleted_at": nil,
		},
		bson.M{"$set": bson.M{"deleted_at": now}},
	)
	if err != nil {
		return err
	}

	if result.ModifiedCount > 0 {
		_, err = r.productCollection.UpdateOne(ctx,
			bson.M{"_id": productID},
			bson.M{"$inc": bson.M{"favorite_count": -1}},
		)
		if err != nil {
			return err
		}
	}

	return nil
}

func (r *repository) CountByUser(ctx context.Context, userID string) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{
		"user_id":    userID,
		"deleted_at": nil,
	})
}