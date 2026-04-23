package product

import (
	"catalog-service/databases"
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Repository interface {
	FindMany(ctx context.Context, filter bson.M, opts *options.FindOptions) ([]databases.Product, int64, error)
	Create(ctx context.Context, product databases.Product) (databases.Product, error)
	FindById(ctx context.Context, id string) (databases.Product, error)
	FindBySlug(ctx context.Context, slug string) (databases.Product, error)
	Update(ctx context.Context, id string, product databases.Product) (databases.Product, error)
	Delete(ctx context.Context, id string) error
}

type repository struct {
	collection *mongo.Collection
}

func NewRepository(db *mongo.Database) Repository {
	return &repository{
		collection: db.Collection("products"),
	}
}

func (r *repository) FindMany(
	ctx context.Context,
	filter bson.M,
	opts *options.FindOptions,
) ([]databases.Product, int64, error) {

	if filter == nil {
		filter = bson.M{}
	}

	filter["deleted_at"] = bson.M{"$eq": nil}

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var products []databases.Product

	for cursor.Next(ctx) {
		var product databases.Product
		if err := cursor.Decode(&product); err != nil {
			return nil, 0, err
		}
		products = append(products, product)
	}

	if err := cursor.Err(); err != nil {
		return nil, 0, err
	}

	count, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	return products, count, nil
}

func (r *repository) Create(
	ctx context.Context,
	product databases.Product,
) (databases.Product, error) {

	_, err := r.collection.InsertOne(ctx, product)
	if err != nil {
		return databases.Product{}, err
	}

	return product, nil
}

func (r *repository) FindById(
	ctx context.Context,
	id string,
) (databases.Product, error) {

	var product databases.Product

	err := r.collection.FindOne(
		ctx,
		bson.M{
			"_id":        id,
			"deleted_at": bson.M{"$eq": nil},
		},
	).Decode(&product)

	return product, err
}

func (r *repository) FindBySlug(
	ctx context.Context,
	slug string,
) (databases.Product, error) {

	var product databases.Product

	err := r.collection.FindOne(
		ctx,
		bson.M{
			"slug":       slug,
			"deleted_at": bson.M{"$eq": nil},
		},
	).Decode(&product)

	return product, err
}

func (r *repository) Update(
	ctx context.Context,
	id string,
	product databases.Product,
) (databases.Product, error) {

	update := bson.M{
		"$set": bson.M{
			"shop_id":         product.ShopID,
			"category_id":     product.CategoryID,
			"name":            product.Name,
			"slug":            product.Slug,
			"description":     product.Description,
			"sku":             product.SKU,
			"is_active":       product.IsActive,
			"inventory_id":    product.InventoryID,
			"price_id":        product.PriceID,
			"image_ids":       product.ImageIDs,
			"discount_ids":    product.DiscountIDs,
			"eco_id":          product.EcoID,
			"updated_at":      product.UpdatedAt,
		},
	}

	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{
			"_id":        id,
			"deleted_at": bson.M{"$eq": nil},
		},
		update,
	)

	if err != nil {
		return databases.Product{}, err
	}

	return product, nil
}

func (r *repository) Delete(
	ctx context.Context,
	id string,
) error {

	now := time.Now()

	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{
			"_id":        id,
			"deleted_at": bson.M{"$eq": nil},
		},
		bson.M{
			"$set": bson.M{
				"deleted_at": now,
			},
		},
	)

	return err
}