package productimage

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Repository interface {
	Create(ctx context.Context, img ProductImage) (ProductImage, error)
	FindByID(ctx context.Context, id string) (ProductImage, error)
	FindByProductID(ctx context.Context, productID string) ([]ProductImage, error)
	SetPrimary(ctx context.Context, productID string, imageID string) error
	UpdateOrder(ctx context.Context, imageID string, order int) error
	Delete(ctx context.Context, id string) error
	DeleteByFileID(ctx context.Context, fileID string) error
}

type repository struct {
	collection *mongo.Collection
}

func NewRepository(db *mongo.Database) Repository {
	return &repository{
		collection: db.Collection("product_images"),
	}
}

func (r *repository) Create(ctx context.Context, img ProductImage) (ProductImage, error) {
	img.BeforeCreate()
	_, err := r.collection.InsertOne(ctx, img)
	return img, err
}

func (r *repository) FindByID(ctx context.Context, id string) (ProductImage, error) {
	var img ProductImage
	err := r.collection.FindOne(ctx, bson.M{"_id": id, "deleted_at": nil}).Decode(&img)
	return img, err
}

func (r *repository) FindByProductID(ctx context.Context, productID string) ([]ProductImage, error) {
	cursor, err := r.collection.Find(ctx,
		bson.M{"product_id": productID, "deleted_at": nil},
		options.Find().SetSort(bson.D{{Key: "order", Value: 1}}),
	)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var images []ProductImage
	if err := cursor.All(ctx, &images); err != nil {
		return nil, err
	}
	return images, nil
}

func (r *repository) SetPrimary(ctx context.Context, productID string, imageID string) error {
	_, err := r.collection.UpdateMany(ctx,
		bson.M{"product_id": productID, "deleted_at": nil},
		bson.M{"$set": bson.M{"is_primary": false, "updated_at": time.Now()}},
	)
	if err != nil {
		return err
	}
	_, err = r.collection.UpdateOne(ctx,
		bson.M{"_id": imageID, "deleted_at": nil},
		bson.M{"$set": bson.M{"is_primary": true, "updated_at": time.Now()}},
	)
	return err
}

func (r *repository) UpdateOrder(ctx context.Context, imageID string, order int) error {
	_, err := r.collection.UpdateOne(ctx,
		bson.M{"_id": imageID, "deleted_at": nil},
		bson.M{"$set": bson.M{"order": order, "updated_at": time.Now()}},
	)
	return err
}

func (r *repository) Delete(ctx context.Context, id string) error {
	_, err := r.collection.UpdateOne(ctx,
		bson.M{"_id": id},
		bson.M{"$set": bson.M{"deleted_at": time.Now()}},
	)
	return err
}

func (r *repository) DeleteByFileID(ctx context.Context, fileID string) error {
	_, err := r.collection.UpdateOne(ctx,
		bson.M{"file_id": fileID},
		bson.M{"$set": bson.M{"deleted_at": time.Now()}},
	)
	return err
}
