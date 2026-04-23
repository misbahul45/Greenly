package price

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository interface {
	Create(ctx context.Context, price Price) (Price, error)
	FindByProductID(ctx context.Context, productID string) (Price, error)
	Update(ctx context.Context, productID string, price Price) (Price, error)
	Delete(ctx context.Context, productID string) error
}

type repository struct {
	collection *mongo.Collection
}

func NewRepository(db *mongo.Database) Repository {
	return &repository{
		collection: db.Collection("prices"),
	}
}

func (r *repository) Create(ctx context.Context, price Price) (Price, error) {
	price.BeforeCreate()
	_, err := r.collection.InsertOne(ctx, price)
	return price, err
}

func (r *repository) FindByProductID(ctx context.Context, productID string) (Price, error) {
	var price Price
	err := r.collection.FindOne(ctx, bson.M{"product_id": productID, "deleted_at": nil}).Decode(&price)
	return price, err
}

func (r *repository) Update(ctx context.Context, productID string, price Price) (Price, error) {
	price.BeforeUpdate()
	update := bson.M{"$set": bson.M{
		"amount":     price.Amount,
		"currency":  price.Currency,
		"updated_at": price.UpdatedAt,
	}}
	_, err := r.collection.UpdateOne(ctx, bson.M{"product_id": productID, "deleted_at": nil}, update)
	return price, err
}

func (r *repository) Delete(ctx context.Context, productID string) error {
	_, err := r.collection.UpdateOne(ctx,
		bson.M{"product_id": productID},
		bson.M{"$set": bson.M{"deleted_at": time.Now()}},
	)
	return err
}