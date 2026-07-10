package databases

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func Connect(uri string) (*mongo.Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(uri)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	fmt.Println("Successfully connected to MongoDB")
	return client, nil
}

func CreateCategoryIndexes(collection *mongo.Collection) error {
	ctx := context.Background()
	if err := ensureIndex(ctx, collection, indexSpec{
		Name:    "uniq_active_category_slug",
		Keys:    bson.D{{Key: "slug", Value: 1}},
		Unique:  true,
		Partial: bson.M{"deleted_at": nil},
	}); err != nil {
		return err
	}

	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "parent_id", Value: 1}, {Key: "order", Value: 1}, {Key: "name", Value: 1}},
			Options: options.Index().SetName("idx_category_parent_order_name"),
		},
		{
			Keys:    bson.D{{Key: "name", Value: "text"}},
			Options: options.Index().SetName("idx_category_name_text"),
		},
		{
			Keys:    bson.D{{Key: "deleted_at", Value: 1}},
			Options: options.Index().SetName("idx_category_deleted_at"),
		},
	}

	if err := dropSameKeyLegacyIndexes(ctx, collection, indexes); err != nil {
		return err
	}
	_, err := collection.Indexes().CreateMany(ctx, indexes)
	return err
}

func CreateProductIndexes(collection *mongo.Collection) error {
	ctx := context.Background()
	if err := ensureIndex(ctx, collection, indexSpec{
		Name:    "uniq_active_product_slug",
		Keys:    bson.D{{Key: "slug", Value: 1}},
		Unique:  true,
		Partial: bson.M{"deleted_at": nil},
	}); err != nil {
		return err
	}

	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "shop_id", Value: 1}, {Key: "is_active", Value: 1}, {Key: "created_at", Value: -1}},
			Options: options.Index().SetName("idx_product_shop_active_created"),
		},
		{
			Keys:    bson.D{{Key: "category_id", Value: 1}, {Key: "is_active", Value: 1}},
			Options: options.Index().SetName("idx_product_category_active"),
		},
		{
			Keys:    bson.D{{Key: "name", Value: "text"}, {Key: "description", Value: "text"}, {Key: "sku", Value: "text"}},
			Options: options.Index().SetName("idx_product_search_text"),
		},
		{
			Keys:    bson.D{{Key: "rating_average", Value: -1}, {Key: "review_count", Value: -1}},
			Options: options.Index().SetName("idx_product_rating"),
		},
		{
			Keys:    bson.D{{Key: "price", Value: 1}, {Key: "is_active", Value: 1}},
			Options: options.Index().SetName("idx_product_price_active"),
		},
		{
			Keys:    bson.D{{Key: "deleted_at", Value: 1}},
			Options: options.Index().SetName("idx_product_deleted_at"),
		},
	}

	if err := dropSameKeyLegacyIndexes(ctx, collection, indexes); err != nil {
		return err
	}
	_, err := collection.Indexes().CreateMany(ctx, indexes)
	return err
}

func CreateCatalogIndexes(db *mongo.Database) error {
	ctx := context.Background()
	collections := map[string][]mongo.IndexModel{
		"product_variants": {
			namedUniquePartialIndex("uniq_active_product_variant_sku", bson.D{{Key: "sku", Value: 1}}),
			namedIndex("idx_product_variant_product_sku", bson.D{{Key: "product_id", Value: 1}, {Key: "sku", Value: 1}}),
			namedIndex("idx_product_variant_deleted_at", bson.D{{Key: "deleted_at", Value: 1}}),
		},
		"prices": {
			namedUniquePartialIndex("uniq_active_price_product", bson.D{{Key: "product_id", Value: 1}}),
			namedIndex("idx_price_deleted_at", bson.D{{Key: "deleted_at", Value: 1}}),
		},
		"inventories": {
			namedUniquePartialIndex("uniq_active_inventory_product", bson.D{{Key: "product_id", Value: 1}}),
			namedIndex("idx_inventory_deleted_at", bson.D{{Key: "deleted_at", Value: 1}}),
		},
		"product_images": {
			namedUniquePartialIndex("uniq_active_product_image_order", bson.D{{Key: "product_id", Value: 1}, {Key: "order", Value: 1}}),
			namedIndex("idx_product_image_primary", bson.D{{Key: "product_id", Value: 1}, {Key: "is_primary", Value: 1}}),
			namedIndex("idx_product_image_deleted_at", bson.D{{Key: "deleted_at", Value: 1}}),
		},
		"product_discounts": {
			namedIndex("idx_discount_product_active_dates", bson.D{{Key: "product_id", Value: 1}, {Key: "is_active", Value: 1}, {Key: "valid_from", Value: 1}, {Key: "valid_to", Value: 1}}),
			namedIndex("idx_discount_deleted_at", bson.D{{Key: "deleted_at", Value: 1}}),
		},
		"eco_attributes": {
			namedUniquePartialIndex("uniq_active_eco_attribute_product", bson.D{{Key: "product_id", Value: 1}}),
			namedIndex("idx_eco_score", bson.D{{Key: "eco_score", Value: -1}}),
			namedIndex("idx_eco_attribute_deleted_at", bson.D{{Key: "deleted_at", Value: 1}}),
		},
		"active_prices": {
			namedUniqueIndex("uniq_active_price_snapshot_product", bson.D{{Key: "product_id", Value: 1}}),
		},
		"favorite_products": {
			namedUniquePartialIndex("uniq_favorite_user_product", bson.D{{Key: "user_id", Value: 1}, {Key: "product_id", Value: 1}}),
			namedIndex("idx_favorite_user", bson.D{{Key: "user_id", Value: 1}}),
			namedIndex("idx_favorite_product", bson.D{{Key: "product_id", Value: 1}}),
		},
		"product_reviews": {
			namedIndex("idx_review_product_created", bson.D{{Key: "product_id", Value: 1}, {Key: "created_at", Value: -1}}),
			namedIndex("idx_review_user", bson.D{{Key: "user_id", Value: 1}}),
			namedIndex("idx_review_deleted_at", bson.D{{Key: "deleted_at", Value: 1}}),
		},
		"review_replies": {
			namedIndex("idx_review_reply_review", bson.D{{Key: "review_id", Value: 1}}),
			namedIndex("idx_review_reply_deleted_at", bson.D{{Key: "deleted_at", Value: 1}}),
		},
		"product_ratings": {
			namedUniqueIndex("uniq_product_rating_product", bson.D{{Key: "product_id", Value: 1}}),
		},
		"product_views": {
			namedIndex("idx_product_view_product_created", bson.D{{Key: "product_id", Value: 1}, {Key: "created_at", Value: -1}}),
			namedIndex("idx_product_view_user", bson.D{{Key: "user_id", Value: 1}}),
			namedIndex("idx_product_view_deleted_at", bson.D{{Key: "deleted_at", Value: 1}}),
		},
		"product_analytics": {
			namedUniqueIndex("uniq_product_analytics_product", bson.D{{Key: "product_id", Value: 1}}),
		},
	}

	if err := CreateCategoryIndexes(db.Collection("categories")); err != nil {
		return fmt.Errorf("categories indexes: %w", err)
	}
	if err := CreateProductIndexes(db.Collection("products")); err != nil {
		return fmt.Errorf("products indexes: %w", err)
	}

	for collectionName, indexes := range collections {
		collection := db.Collection(collectionName)
		if err := dropSameKeyLegacyIndexes(ctx, collection, indexes); err != nil {
			return fmt.Errorf("%s indexes: %w", collectionName, err)
		}
		if _, err := collection.Indexes().CreateMany(ctx, indexes); err != nil {
			return fmt.Errorf("%s indexes: %w", collectionName, err)
		}
	}

	return nil
}

type indexSpec struct {
	Name    string
	Keys    bson.D
	Unique  bool
	Partial bson.M
}

func ensureIndex(ctx context.Context, collection *mongo.Collection, spec indexSpec) error {
	indexes, err := listIndexes(ctx, collection)
	if err != nil {
		return err
	}

	for _, index := range indexes {
		name := indexName(index)
		if name == "_id_" {
			continue
		}

		if indexKeyEquals(index["key"], spec.Keys) && (name != spec.Name || !indexMatchesSpec(index, spec)) {
			if err := dropIndexIfExists(ctx, collection, name); err != nil {
				return err
			}
			log.Printf("⚠️  Dropped legacy index %s.%s before recreating %s", collection.Name(), name, spec.Name)
		}
	}

	model := mongo.IndexModel{
		Keys: spec.Keys,
		Options: options.Index().
			SetName(spec.Name).
			SetUnique(spec.Unique).
			SetPartialFilterExpression(spec.Partial),
	}
	_, err = collection.Indexes().CreateOne(ctx, model)
	return err
}

func dropSameKeyLegacyIndexes(ctx context.Context, collection *mongo.Collection, models []mongo.IndexModel) error {
	indexes, err := listIndexes(ctx, collection)
	if err != nil {
		return err
	}

	for _, model := range models {
		targetName := modelName(model)
		keys, ok := model.Keys.(bson.D)
		if !ok {
			continue
		}
		for _, index := range indexes {
			name := indexName(index)
			if name == "_id_" || name == targetName {
				continue
			}
			if indexKeyEquals(index["key"], keys) {
				if err := dropIndexIfExists(ctx, collection, name); err != nil {
					return err
				}
				log.Printf("⚠️  Dropped legacy index %s.%s before recreating %s", collection.Name(), name, targetName)
			}
		}
	}

	return nil
}

func listIndexes(ctx context.Context, collection *mongo.Collection) ([]bson.M, error) {
	cursor, err := collection.Indexes().List(ctx)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var indexes []bson.M
	if err := cursor.All(ctx, &indexes); err != nil {
		return nil, err
	}
	return indexes, nil
}

func dropIndexIfExists(ctx context.Context, collection *mongo.Collection, name string) error {
	if name == "" {
		return nil
	}
	_, err := collection.Indexes().DropOne(ctx, name)
	if err == nil {
		return nil
	}
	if commandErr, ok := err.(mongo.CommandError); ok && (commandErr.Code == 26 || commandErr.Code == 27) {
		return nil
	}
	message := strings.ToLower(err.Error())
	if strings.Contains(message, "indexnotfound") || strings.Contains(message, "index not found") || strings.Contains(message, "ns not found") {
		return nil
	}
	return err
}

func indexMatchesSpec(index bson.M, spec indexSpec) bool {
	return indexBool(index["unique"]) == spec.Unique && partialDeletedAtNull(index["partialFilterExpression"]) && !indexBool(index["sparse"])
}

func partialDeletedAtNull(value interface{}) bool {
	m, ok := toMap(value)
	if !ok {
		return false
	}
	deletedAt, ok := m["deleted_at"]
	if !ok {
		return false
	}
	if deletedAt == nil {
		return true
	}
	if nested, ok := toMap(deletedAt); ok {
		eqValue, hasEq := nested["$eq"]
		return hasEq && eqValue == nil
	}
	return false
}

func indexKeyEquals(actual interface{}, expected bson.D) bool {
	actualD, ok := toD(actual)
	if !ok || len(actualD) != len(expected) {
		return false
	}
	for i := range expected {
		if actualD[i].Key != expected[i].Key || fmt.Sprint(actualD[i].Value) != fmt.Sprint(expected[i].Value) {
			return false
		}
	}
	return true
}

func toD(value interface{}) (bson.D, bool) {
	switch v := value.(type) {
	case bson.D:
		return v, true
	case bson.M:
		if len(v) != 1 {
			return nil, false
		}
		for key, value := range v {
			return bson.D{{Key: key, Value: value}}, true
		}
	}
	return nil, false
}

func toMap(value interface{}) (map[string]interface{}, bool) {
	switch v := value.(type) {
	case bson.M:
		return v, true
	case map[string]interface{}:
		return v, true
	}
	return nil, false
}

func indexName(index bson.M) string {
	name, _ := index["name"].(string)
	return name
}

func indexBool(value interface{}) bool {
	boolean, _ := value.(bool)
	return boolean
}

func modelName(model mongo.IndexModel) string {
	if model.Options == nil || model.Options.Name == nil {
		return ""
	}
	return *model.Options.Name
}

func namedIndex(name string, keys bson.D) mongo.IndexModel {
	return mongo.IndexModel{Keys: keys, Options: options.Index().SetName(name)}
}

func namedUniqueIndex(name string, keys bson.D) mongo.IndexModel {
	return mongo.IndexModel{Keys: keys, Options: options.Index().SetName(name).SetUnique(true)}
}

func namedUniquePartialIndex(name string, keys bson.D) mongo.IndexModel {
	return mongo.IndexModel{
		Keys: keys,
		Options: options.Index().
			SetName(name).
			SetUnique(true).
			SetPartialFilterExpression(bson.M{"deleted_at": nil}),
	}
}
