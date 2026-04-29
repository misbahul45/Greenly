package seeds

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func SeedProductImages(ctx context.Context, db *mongo.Database) {
	col := db.Collection("product_images")
	now := time.Now()

	type imgData struct {
		id        string
		productID string
		url       string
		isPrimary bool
		order     int
	}

	images := []imgData{
		{"img-001-1", "prod-001", "https://imagekit.io/greenly/products/samsung-a55-1.jpg", true, 0},
		{"img-001-2", "prod-001", "https://imagekit.io/greenly/products/samsung-a55-2.jpg", false, 1},
		{"img-002-1", "prod-002", "https://imagekit.io/greenly/products/sony-wh1000xm5-1.jpg", true, 0},
		{"img-002-2", "prod-002", "https://imagekit.io/greenly/products/sony-wh1000xm5-2.jpg", false, 1},
		{"img-003-1", "prod-003", "https://imagekit.io/greenly/products/smartwatch-s8-1.jpg", true, 0},
		{"img-004-1", "prod-004", "https://imagekit.io/greenly/products/dress-batik-1.jpg", true, 0},
		{"img-004-2", "prod-004", "https://imagekit.io/greenly/products/dress-batik-2.jpg", false, 1},
		{"img-005-1", "prod-005", "https://imagekit.io/greenly/products/kemeja-flanel-1.jpg", true, 0},
		{"img-006-1", "prod-006", "https://imagekit.io/greenly/products/rendang-1.jpg", true, 0},
		{"img-006-2", "prod-006", "https://imagekit.io/greenly/products/rendang-2.jpg", false, 1},
		{"img-007-1", "prod-007", "https://imagekit.io/greenly/products/kopi-gayo-1.jpg", true, 0},
		{"img-008-1", "prod-008", "https://imagekit.io/greenly/products/nike-pegasus-1.jpg", true, 0},
		{"img-008-2", "prod-008", "https://imagekit.io/greenly/products/nike-pegasus-2.jpg", false, 1},
		{"img-009-1", "prod-009", "https://imagekit.io/greenly/products/serum-vitc-1.jpg", true, 0},
		{"img-009-2", "prod-009", "https://imagekit.io/greenly/products/serum-vitc-2.jpg", false, 1},
		{"img-010-1", "prod-010", "https://imagekit.io/greenly/products/sunscreen-1.jpg", true, 0},
		{"img-010-2", "prod-010", "https://imagekit.io/greenly/products/sunscreen-2.jpg", false, 1},
	}

	for _, img := range images {
		doc := bson.M{
			"_id":         img.id,
			"product_id":  img.productID,
			"product_key": img.productID,
			"url":         img.url,
			"file_id":     img.id,
			"is_primary":  img.isPrimary,
			"order":       img.order,
			"created_at":  now,
			"updated_at":  now,
			"deleted_at":  nil,
		}
		filter := bson.M{"_id": doc["_id"]}
		update := bson.M{"$setOnInsert": doc}
		opts := options.Update().SetUpsert(true)
		if _, err := col.UpdateOne(ctx, filter, update, opts); err != nil {
			log.Printf("⚠️  Image %s: %v", img.id, err)
		}
	}

	log.Printf("✅ Product images seeded (%d)", len(images))
}
