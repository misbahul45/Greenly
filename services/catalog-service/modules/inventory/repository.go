package inventory

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository interface {
	Create(ctx context.Context, inv Inventory) (Inventory, error)
	FindByProductID(ctx context.Context, productID string) (Inventory, error)
	Update(ctx context.Context, productID string, inv Inventory) (Inventory, error)
	UpdateStock(ctx context.Context, productID string, stock int) error
	ReserveStock(ctx context.Context, productID string, quantity int) error
	ReleaseStock(ctx context.Context, productID string, quantity int) error
	Delete(ctx context.Context, productID string) error
}

type repository struct {
	collection *mongo.Collection
}

func NewRepository(db *mongo.Database) Repository {
	return &repository{
		collection: db.Collection("inventories"),
	}
}

func (r *repository) Create(ctx context.Context, inv Inventory) (Inventory, error) {
	inv.BeforeCreate()
	_, err := r.collection.InsertOne(ctx, inv)
	return inv, err
}

func (r *repository) FindByProductID(ctx context.Context, productID string) (Inventory, error) {
	var inv Inventory
	err := r.collection.FindOne(ctx, bson.M{"product_id": productID, "deleted_at": nil}).Decode(&inv)
	return inv, err
}

func (r *repository) Update(ctx context.Context, productID string, inv Inventory) (Inventory, error) {
	inv.BeforeUpdate()
	update := bson.M{"$set": bson.M{
		"stock":              inv.Stock,
		"reserved_stock":     inv.ReservedStock,
		"low_stock_threshold": inv.LowStockThreshold,
		"updated_at":         inv.UpdatedAt,
	}}
	_, err := r.collection.UpdateOne(ctx, bson.M{"product_id": productID}, update)
	return inv, err
}

func (r *repository) UpdateStock(ctx context.Context, productID string, stock int) error {
	_, err := r.collection.UpdateOne(ctx,
		bson.M{"product_id": productID},
		bson.M{"$set": bson.M{"stock": stock, "updated_at": time.Now()}},
	)
	return err
}

func (r *repository) ReserveStock(ctx context.Context, productID string, quantity int) error {
	_, err := r.collection.UpdateOne(ctx,
		bson.M{"product_id": productID, "stock": bson.M{"$gte": quantity}},
		bson.M{
			"$inc": bson.M{
				"reserved_stock": quantity,
				"stock":          -quantity,
			},
			"$set": bson.M{"updated_at": time.Now()},
		},
	)
	return err
}

func (r *repository) ReleaseStock(ctx context.Context, productID string, quantity int) error {
	_, err := r.collection.UpdateOne(ctx,
		bson.M{"product_id": productID},
		bson.M{
			"$inc": bson.M{
				"reserved_stock": -quantity,
				"stock":          quantity,
			},
			"$set": bson.M{"updated_at": time.Now()},
		},
	)
	return err
}

func (r *repository) Delete(ctx context.Context, productID string) error {
	_, err := r.collection.UpdateOne(ctx,
		bson.M{"product_id": productID},
		bson.M{"$set": bson.M{"deleted_at": time.Now()}},
	)
	return err
}