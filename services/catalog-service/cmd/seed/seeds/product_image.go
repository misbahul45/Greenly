package seeds

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

func SeedProductImages(ctx context.Context, db *mongo.Database, productIDs []string) {
	col := db.Collection("product_images")
	now := time.Now()

	queries := []string{
		"smartphone",
		"iphone",
		"android phone",
		"tablet",
		"laptop",
		"headphones",
		"earbuds",
		"camera",
		"batik dress",
		"traditional clothing",
		"kebaya",
		"flannel shirt",
		"batik shirt",
		"leather bag",
		"heels shoes",
		"formal shoes",
		"rendang",
		"coffee beans",
		"sambal",
		"snack chips",
		"indonesian sweets",
		"running shoes",
		"football jersey",
		"dumbbell",
		"yoga mat",
		"protein powder",
		"skincare serum",
		"moisturizer",
		"face toner",
		"sunscreen",
		"foundation makeup",
		"lip tint",
		"hair serum",
		"shampoo",
	}

	docs := make([]interface{}, 0)

	for i, productID := range productIDs {
		query := queries[i%len(queries)]

		for j := 0; j < 3; j++ {
			docs = append(docs, map[string]interface{}{
				"_id":         NewID(),
				"product_id":  productID,
				"product_key": productID,
				"url":         fmt.Sprintf("https://source.unsplash.com/800x800/?%s&sig=%d", query, j),
				"file_id":     NewID(),
				"is_primary":  j == 0,
				"order":       j,
				"created_at":  now,
				"updated_at":  now,
				"deleted_at":  nil,
			})
		}
	}

	if _, err := col.InsertMany(ctx, docs); err != nil {
		log.Printf("⚠️  Product images insert: %v", err)
	}

	log.Printf("✅ Product images seeded (%d)", len(docs))
}