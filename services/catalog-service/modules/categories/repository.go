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
	CountProductByCategory(ctx context.Context, categoryID string) (int, error)
	FindByParentID(ctx context.Context, parentID *string) ([]databases.Category, error)
	FindAllActive(ctx context.Context) ([]databases.Category, error)
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

	if err == mongo.ErrNoDocuments {
		return databases.Category{}, ErrCategoryNotFound
	}

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

	if err == mongo.ErrNoDocuments {
		return databases.Category{}, ErrCategoryNotFound
	}

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

	res, err := r.collection.UpdateOne(
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

	if res.MatchedCount == 0 {
		return databases.Category{}, ErrCategoryNotFound
	}

	return category, nil
}

func (r *repository) Delete(
	ctx context.Context,
	id string,
) error {

	now := time.Now()

	res, err := r.collection.UpdateOne(
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

	if err != nil {
		return err
	}

	if res.MatchedCount == 0 {
		return ErrCategoryNotFound
	}

	return nil
}

func (r *repository) CountProductByCategory(
	ctx context.Context,
	categoryID string,
) (int, error) {

	count, err := r.collection.Database().Collection("products").CountDocuments(
		ctx,
		bson.M{
			"category_id": categoryID,
			"is_active":   true,
			"deleted_at":  bson.M{"$eq": nil},
		},
	)

	if err != nil {
		return 0, err
	}

	return int(count), nil
}

func (r *repository) FindByParentID(
	ctx context.Context,
	parentID *string,
) ([]databases.Category, error) {

	filter := bson.M{
		"deleted_at": bson.M{"$eq": nil},
	}

	if parentID != nil && *parentID != "" {
		filter["parent_id"] = *parentID
	} else {
		filter["$or"] = []bson.M{
			{"parent_id": bson.M{"$exists": false}},
			{"parent_id": nil},
		}
	}

	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var categories []databases.Category
	if err := cursor.All(ctx, &categories); err != nil {
		return nil, err
	}

	return categories, nil
}

func (r *repository) FindAllActive(
	ctx context.Context,
) ([]databases.Category, error) {

	filter := bson.M{
		"deleted_at": bson.M{"$eq": nil},
		"is_active": true,
	}

	opts := options.Find().SetSort(bson.D{
		{Key: "order", Value: 1},
		{Key: "name", Value: 1},
	})

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var categories []databases.Category
	if err := cursor.All(ctx, &categories); err != nil {
		return nil, err
	}

	return categories, nil
}