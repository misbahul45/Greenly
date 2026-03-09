package product

import (
	"catalog-service/databases"
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
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

	filter := bson.M{}

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
		SetLimit(limit)

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

func (r *productRepository) FindOne(ctx context.Context, id string) (databases.Product, error) {

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return databases.Product{}, err
	}

	var product databases.Product

	err = r.collection.FindOne(ctx, bson.M{
		"_id": objectID,
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

	product.ID = primitive.NewObjectID()
	product.CreatedAt = time.Now()
	product.UpdatedAt = time.Now()

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

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return databases.Product{}, err
	}

	product.UpdatedAt = time.Now()

	update := bson.M{
		"$set": bson.M{
			"name":        product.Name,
			"description": product.Description,
			"sku":         product.SKU,
			"is_active":   product.IsActive,
			"updated_at":  product.UpdatedAt,
		},
	}

	_, err = r.collection.UpdateByID(ctx, objectID, update)
	if err != nil {
		return databases.Product{}, err
	}

	return r.FindOne(ctx, id)
}

func (r *productRepository) Delete(ctx context.Context, id string) error {

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	_, err = r.collection.DeleteOne(ctx, bson.M{
		"_id": objectID,
	})

	return err
}