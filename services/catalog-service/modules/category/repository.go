package category

import (
	"catalog-service/databases"
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Repository interface {
	FindMany(ctx context.Context, filter bson.M, opts *options.FindOptions) ([]databases.Category, int64, error)
	Create(ctx context.Context, category databases.Category) (databases.Category, error)
	FindById(ctx context.Context, id string) (databases.Category, error)
	FindBySlug(ctx context.Context, slug string) (databases.Category, error)
	Update(ctx context.Context, id string, category databases.Category) (databases.Category, error)
	Delete(ctx context.Context, id string) error
}

type repository struct {
	collection *mongo.Collection
}

func NewRepository(db *mongo.Database) Repository {
	return &repository{
		collection: db.Collection("categories"),
	}
}

func (r *repository) FindMany(
	ctx context.Context,
	filter bson.M,
	opts *options.FindOptions,
) ([]databases.Category, int64, error) {

	if filter == nil {
		filter = bson.M{}
	}

	filter["deleted_at"] = bson.M{"$eq": nil}

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var categories []databases.Category

	for cursor.Next(ctx) {
		var category databases.Category
		if err := cursor.Decode(&category); err != nil {
			return nil, 0, err
		}
		categories = append(categories, category)
	}

	if err := cursor.Err(); err != nil {
		return nil, 0, err
	}

	count, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	return categories, count, nil
}

func (r *repository) Create(
	ctx context.Context,
	category databases.Category,
) (databases.Category, error) {

	_, err := r.collection.InsertOne(ctx, category)
	if err != nil {
		return databases.Category{}, err
	}

	return category, nil
}

func (r *repository) FindById(
	ctx context.Context,
	id string,
) (databases.Category, error) {

	var category databases.Category

	err := r.collection.FindOne(
		ctx,
		bson.M{
			"_id":        id,
			"deleted_at": bson.M{"$eq": nil},
		},
	).Decode(&category)

	return category, err
}

func (r *repository) FindBySlug(
	ctx context.Context,
	slug string,
) (databases.Category, error) {

	var category databases.Category

	err := r.collection.FindOne(
		ctx,
		bson.M{
			"slug":       slug,
			"deleted_at": bson.M{"$eq": nil},
		},
	).Decode(&category)

	return category, err
}

func (r *repository) Update(
	ctx context.Context,
	id string,
	category databases.Category,
) (databases.Category, error) {

	update := bson.M{
		"$set": bson.M{
			"name":       category.Name,
			"slug":       category.Slug,
			"parent_id":  category.ParentID,
			"updated_at": category.UpdatedAt,
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
		return databases.Category{}, err
	}

	return category, nil
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