package ecoattribute

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository interface {
	Create(ctx context.Context, eco EcoAttribute) (EcoAttribute, error)
	FindByProductID(ctx context.Context, productID string) (EcoAttribute, error)
	Update(ctx context.Context, productID string, eco EcoAttribute) (EcoAttribute, error)
	Delete(ctx context.Context, productID string) error
}

type repository struct {
	collection *mongo.Collection
}

func NewRepository(db *mongo.Database) Repository {
	return &repository{
		collection: db.Collection("eco_attributes"),
	}
}

func (r *repository) Create(ctx context.Context, eco EcoAttribute) (EcoAttribute, error) {
	eco.BeforeCreate()
	_, err := r.collection.InsertOne(ctx, eco)
	return eco, err
}

func (r *repository) FindByProductID(ctx context.Context, productID string) (EcoAttribute, error) {
	var eco EcoAttribute
	err := r.collection.FindOne(ctx, bson.M{"product_id": productID, "deleted_at": nil}).Decode(&eco)
	return eco, err
}

func (r *repository) Update(ctx context.Context, productID string, eco EcoAttribute) (EcoAttribute, error) {
	eco.BeforeUpdate()
	update := bson.M{"$set": bson.M{
		"carbon_footprint": eco.CarbonFootprint,
		"recyclable":       eco.Recyclable,
		"material_type":    eco.MaterialType,
		"eco_score":        eco.EcoScore,
		"updated_at":       eco.UpdatedAt,
	}}
	_, err := r.collection.UpdateOne(ctx, bson.M{"product_id": productID, "deleted_at": nil}, update)
	return eco, err
}

func (r *repository) Delete(ctx context.Context, productID string) error {
	_, err := r.collection.UpdateOne(ctx,
		bson.M{"product_id": productID},
		bson.M{"$set": bson.M{"deleted_at": time.Now()}},
	)
	return err
}
