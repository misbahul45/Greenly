package activeprice

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository interface {
	FindByProductID(ctx context.Context, productID string) (ActivePrice, error)
	Create(ctx context.Context, ap ActivePrice) (ActivePrice, error)
	Update(ctx context.Context, productID string, ap ActivePrice) (ActivePrice, error)
}

type repository struct {
	collection *mongo.Collection
}

func NewRepository(db *mongo.Database) Repository {
	return &repository{
		collection: db.Collection("active_prices"),
	}
}

func (r *repository) FindByProductID(ctx context.Context, productID string) (ActivePrice, error) {
	var ap ActivePrice
	err := r.collection.FindOne(ctx, bson.M{"product_id": productID}).Decode(&ap)
	return ap, err
}

func (r *repository) Create(ctx context.Context, ap ActivePrice) (ActivePrice, error) {
	ap.BeforeCreate()
	_, err := r.collection.InsertOne(ctx, ap)
	return ap, err
}

func (r *repository) Update(ctx context.Context, productID string, ap ActivePrice) (ActivePrice, error) {
	ap.BeforeUpdate()
	update := bson.M{"$set": bson.M{
		"final_price": ap.FinalPrice,
		"updated_at":  ap.UpdatedAt,
	}}
	_, err := r.collection.UpdateOne(ctx, bson.M{"product_id": productID}, update)
	return ap, err
}