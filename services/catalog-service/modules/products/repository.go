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
	FindById(ctx context.Context, id string) (databases.Product, error)
	FindBySlug(ctx context.Context, slug string) (databases.Product, error)
	Create(ctx context.Context, product databases.Product) (databases.Product, error)
	Update(ctx context.Context, id string, product databases.Product) (databases.Product, error)
	Delete(ctx context.Context, id string) error
	CountDocuments(ctx context.Context, filter bson.M) (int64, error)
	FindCategoryById(ctx context.Context, id string) (databases.Category, error)
	CreatePrice(ctx context.Context, price databases.Price) error
	CreateInventory(ctx context.Context, inventory databases.Inventory) error
	CreateImage(ctx context.Context, image databases.ProductImage) error
	GetActivePrice(ctx context.Context, productID string) (databases.Price, error)
	GetInventory(ctx context.Context, productID string) (databases.Inventory, error)
	GetImages(ctx context.Context, productID string) ([]databases.ProductImage, error)
	UpdatePriceByProductID(ctx context.Context, productID string, update bson.M) error
	UpdateInventoryStock(ctx context.Context, productID string, stock int) error
	UpdateImages(ctx context.Context, productID string, imageURLs []string) error
	BulkUpdateOne(ctx context.Context, id string, update bson.M) error
	EnableProductsByShop(ctx context.Context, shopID string) error
}

type repository struct {
	productCollection    *mongo.Collection
	categoryCollection   *mongo.Collection
	priceCollection      *mongo.Collection
	inventoryCollection  *mongo.Collection
	imageCollection      *mongo.Collection
}

func NewRepository(db *mongo.Database) Repository {
	return &repository{
		productCollection:    db.Collection("products"),
		categoryCollection:   db.Collection("categories"),
		priceCollection:      db.Collection("prices"),
		inventoryCollection:  db.Collection("inventories"),
		imageCollection:      db.Collection("product_images"),
	}
}

func (r *repository) FindMany(ctx context.Context, filter bson.M, opts *options.FindOptions) ([]databases.Product, int64, error) {
	if filter == nil {
		filter = bson.M{}
	}
	filter["deleted_at"] = bson.M{"$eq": nil}

	cursor, err := r.productCollection.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var products []databases.Product
	if err := cursor.All(ctx, &products); err != nil {
		return nil, 0, err
	}

	count, err := r.productCollection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	return products, count, nil
}

func (r *repository) FindById(ctx context.Context, id string) (databases.Product, error) {
	var product databases.Product
	err := r.productCollection.FindOne(ctx, bson.M{"_id": id, "deleted_at": bson.M{"$eq": nil}}).Decode(&product)
	return product, err
}

func (r *repository) FindBySlug(ctx context.Context, slug string) (databases.Product, error) {
	var product databases.Product
	err := r.productCollection.FindOne(ctx, bson.M{"slug": slug, "deleted_at": bson.M{"$eq": nil}}).Decode(&product)
	return product, err
}

func (r *repository) Create(ctx context.Context, product databases.Product) (databases.Product, error) {
	_, err := r.productCollection.InsertOne(ctx, product)
	return product, err
}

func (r *repository) Update(ctx context.Context, id string, product databases.Product) (databases.Product, error) {
	update := bson.M{"$set": bson.M{
		"name":         product.Name,
		"slug":         product.Slug,
		"description":  product.Description,
		"sku":          product.SKU,
		"category_id":  product.CategoryID,
		"is_active":    product.IsActive,
		"updated_at":   product.UpdatedAt,
	}}
	_, err := r.productCollection.UpdateOne(ctx, bson.M{"_id": id, "deleted_at": bson.M{"$eq": nil}}, update)
	return product, err
}

func (r *repository) Delete(ctx context.Context, id string) error {
	now := time.Now()
	_, err := r.productCollection.UpdateOne(ctx, bson.M{"_id": id, "deleted_at": bson.M{"$eq": nil}}, bson.M{"$set": bson.M{"deleted_at": now}})
	return err
}

func (r *repository) CountDocuments(ctx context.Context, filter bson.M) (int64, error) {
	return r.productCollection.CountDocuments(ctx, filter)
}

func (r *repository) FindCategoryById(ctx context.Context, id string) (databases.Category, error) {
	var category databases.Category
	err := r.categoryCollection.FindOne(ctx, bson.M{"_id": id, "deleted_at": bson.M{"$eq": nil}}).Decode(&category)
	return category, err
}

func (r *repository) CreatePrice(ctx context.Context, price databases.Price) error {
	_, err := r.priceCollection.InsertOne(ctx, price)
	return err
}

func (r *repository) CreateInventory(ctx context.Context, inventory databases.Inventory) error {
	_, err := r.inventoryCollection.InsertOne(ctx, inventory)
	return err
}

func (r *repository) CreateImage(ctx context.Context, image databases.ProductImage) error {
	_, err := r.imageCollection.InsertOne(ctx, image)
	return err
}

func (r *repository) GetActivePrice(ctx context.Context, productID string) (databases.Price, error) {
	var price databases.Price
	err := r.priceCollection.FindOne(ctx, bson.M{"product_id": productID}).Decode(&price)
	return price, err
}

func (r *repository) GetInventory(ctx context.Context, productID string) (databases.Inventory, error) {
	var inventory databases.Inventory
	err := r.inventoryCollection.FindOne(ctx, bson.M{"product_id": productID}).Decode(&inventory)
	return inventory, err
}

func (r *repository) GetImages(ctx context.Context, productID string) ([]databases.ProductImage, error) {
	cursor, err := r.imageCollection.Find(ctx, bson.M{"product_id": productID}, options.Find().SetSort(bson.D{{Key: "order", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var images []databases.ProductImage
	if err := cursor.All(ctx, &images); err != nil {
		return nil, err
	}
	return images, nil
}

func (r *repository) UpdatePriceByProductID(ctx context.Context, productID string, update bson.M) error {
	_, err := r.priceCollection.UpdateOne(ctx, bson.M{"product_id": productID}, update)
	return err
}

func (r *repository) UpdateInventoryStock(ctx context.Context, productID string, stock int) error {
	_, err := r.inventoryCollection.UpdateOne(ctx, bson.M{"product_id": productID}, bson.M{"$set": bson.M{"stock": stock, "updated_at": time.Now()}})
	return err
}

func (r *repository) UpdateImages(ctx context.Context, productID string, imageURLs []string) error {
	r.imageCollection.DeleteMany(ctx, bson.M{"product_id": productID})
	for i, url := range imageURLs {
		img := databases.ProductImage{
			Base: databases.Base{
				ID:        databases.NewID(),
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			ProductID: productID,
			URL:       url,
			IsPrimary: i == 0,
			Order:     i,
		}
		r.imageCollection.InsertOne(ctx, img)
	}
	return nil
}

func (r *repository) BulkUpdateOne(ctx context.Context, id string, update bson.M) error {
	_, err := r.productCollection.UpdateOne(ctx, bson.M{"_id": id, "deleted_at": bson.M{"$eq": nil}}, update)
	return err
}

func (r *repository) EnableProductsByShop(ctx context.Context, shopID string) error {
	_, err := r.productCollection.UpdateMany(ctx, 
		bson.M{"shop_id": shopID, "deleted_at": bson.M{"$eq": nil}},
		bson.M{"$set": bson.M{"is_active": true, "updated_at": time.Now()}},
	)
	return err
}