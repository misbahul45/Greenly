package databases

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func Connect(uri string) (*mongo.Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(uri)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	fmt.Println("Successfully connected to MongoDB")
	return client, nil
}

func CreateCategoryIndexes(collection *mongo.Collection) error {
	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "slug", Value: 1}},
			Options: options.Index().SetUnique(true).SetPartialFilterExpression(bson.M{"deleted_at": bson.M{"$eq": nil}}),
		},
		{
			Keys: bson.D{{Key: "parent_id", Value: 1}, {Key: "order", Value: 1}, {Key: "name", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "name", Value: "text"}},
		},
		{
			Keys: bson.D{{Key: "deleted_at", Value: 1}},
		},
	}

	_, err := collection.Indexes().CreateMany(context.Background(), indexes)
	return err
}

func CreateProductIndexes(collection *mongo.Collection) error {
	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "slug", Value: 1}},
			Options: options.Index().SetUnique(true).SetPartialFilterExpression(bson.M{"deleted_at": bson.M{"$eq": nil}}),
		},
		{
			Keys: bson.D{{Key: "shop_id", Value: 1}, {Key: "is_active", Value: 1}, {Key: "created_at", Value: -1}},
		},
		{
			Keys: bson.D{{Key: "category_id", Value: 1}, {Key: "is_active", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "name", Value: "text"}, {Key: "description", Value: "text"}, {Key: "sku", Value: "text"}},
		},
		{
			Keys: bson.D{{Key: "rating_average", Value: -1}, {Key: "review_count", Value: -1}},
		},
		{
			Keys: bson.D{{Key: "price", Value: 1}, {Key: "is_active", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "deleted_at", Value: 1}},
		},
	}

	_, err := collection.Indexes().CreateMany(context.Background(), indexes)
	return err
}