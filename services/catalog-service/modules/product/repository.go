package product

import (
	"catalog-service/databases"
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ProductRepository interface {
	FindMany(ctx context.Context, query ProductQuery) ([]databases.Product, int64, error)
	FindOne(ctx context.Context, id string) (databases.Product, error)
	Create(ctx context.Context, product databases.Product) (databases.Product, error)
	Update(ctx context.Context, id string, product databases.Product) (databases.Product, error)
	Delete(ctx context.Context, id string) error
}

type productRepository struct {
	collection *mongo.Collection
}

func NewProductRepository(db *mongo.Database) ProductRepository {
	return &productRepository{
		collection: db.Collection("products"),
	}
}

func (r *productRepository) FindMany(
	ctx context.Context,
	query ProductQuery,
) ([]databases.Product, int64, error) {

	filter := bson.M{
		"deleted_at": bson.M{"$eq": nil},
	}

	if query.Search != "" {
		filter["name"] = bson.M{
			"$regex":   query.Search,
			"$options": "i",
		}
	}

	skip := int64((query.Page - 1) * query.Limit)
	limit := int64(query.Limit)

	opts := options.Find().
		SetSkip(skip).
		SetLimit(limit).
		SetSort(bson.M{"created_at": -1})

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}

	var products []databases.Product

	if err := cursor.All(ctx, &products); err != nil {
		return nil, 0, err
	}

	total, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

func (r *productRepository) FindOne(
	ctx context.Context,
	id string,
) (databases.Product, error) {

	var product databases.Product

	err := r.collection.FindOne(ctx, bson.M{
		"_id":        id,
		"deleted_at": bson.M{"$eq": nil},
	}).Decode(&product)

	if err != nil {
		return databases.Product{}, err
	}

	return product, nil
}

func (r *productRepository) Create(
	ctx context.Context,
	product databases.Product,
) (databases.Product, error) {

	product.BeforeCreate()

	_, err := r.collection.InsertOne(ctx, product)
	if err != nil {
		return databases.Product{}, err
	}

	return product, nil
}

func (r *productRepository) Update(
	ctx context.Context,
	id string,
	product databases.Product,
) (databases.Product, error) {

	product.BeforeUpdate()

	update := bson.M{
		"$set": bson.M{
			"name":        product.Name,
			"description": product.Description,
			"sku":         product.SKU,
			"is_active":   product.IsActive,
			"updated_at":  product.UpdatedAt,
		},
	}

	_, err := r.collection.UpdateByID(ctx, id, update)
	if err != nil {
		return databases.Product{}, err
	}

	return r.FindOne(ctx, id)
}

func (r *productRepository) Delete(
	ctx context.Context,
	id string,
) error {

	now := time.Now()

	_, err := r.collection.UpdateByID(ctx, id, bson.M{
		"$set": bson.M{
			"deleted_at": now,
		},
	})

	return err
}