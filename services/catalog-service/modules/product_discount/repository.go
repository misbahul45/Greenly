package productdiscount

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Repository interface {
	FindByProductID(ctx context.Context, productID string) ([]ProductDiscount, error)
	FindByID(ctx context.Context, id string) (ProductDiscount, error)
	Create(ctx context.Context, discount ProductDiscount) (ProductDiscount, error)
	Update(ctx context.Context, id string, discount ProductDiscount) (ProductDiscount, error)
	Delete(ctx context.Context, id string) error
	FindActiveByProductID(ctx context.Context, productID string) ([]ProductDiscount, error)
}

type repository struct {
	collection *mongo.Collection
}

func NewRepository(db *mongo.Database) Repository {
	return &repository{
		collection: db.Collection("product_discounts"),
	}
}

func (r *repository) FindByProductID(ctx context.Context, productID string) ([]ProductDiscount, error) {
	filter := bson.M{"product_id": productID, "deleted_at": nil}
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var discounts []ProductDiscount
	if err := cursor.All(ctx, &discounts); err != nil {
		return nil, err
	}

	return discounts, nil
}

func (r *repository) FindByID(ctx context.Context, id string) (ProductDiscount, error) {
	var discount ProductDiscount
	err := r.collection.FindOne(ctx, bson.M{"_id": id, "deleted_at": nil}).Decode(&discount)
	return discount, err
}

func (r *repository) Create(ctx context.Context, discount ProductDiscount) (ProductDiscount, error) {
	discount.BeforeCreate()
	_, err := r.collection.InsertOne(ctx, discount)
	return discount, err
}

func (r *repository) Update(ctx context.Context, id string, discount ProductDiscount) (ProductDiscount, error) {
	discount.BeforeUpdate()
	update := bson.M{"$set": bson.M{
		"name":         discount.Name,
		"percentage":  discount.Percentage,
		"fixed_amount": discount.FixedAmount,
		"valid_from":  discount.ValidFrom,
		"valid_to":    discount.ValidTo,
		"is_active":   discount.IsActive,
		"updated_at":  discount.UpdatedAt,
	}}
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id, "deleted_at": nil}, update)
	return discount, err
}

func (r *repository) Delete(ctx context.Context, id string) error {
	_, err := r.collection.UpdateOne(ctx,
		bson.M{"_id": id},
		bson.M{"$set": bson.M{"deleted_at": time.Now()}},
	)
	return err
}

func (r *repository) FindActiveByProductID(ctx context.Context, productID string) ([]ProductDiscount, error) {
	now := time.Now()
	filter := bson.M{
		"product_id":  productID,
		"is_active":  true,
		"valid_from": bson.M{"$lte": now},
		"valid_to":   bson.M{"$gte": now},
		"deleted_at": nil,
	}

	cursor, err := r.collection.Find(ctx, filter, nil)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var discounts []ProductDiscount
	if err := cursor.All(ctx, &discounts); err != nil {
		return nil, err
	}

	return discounts, nil
}