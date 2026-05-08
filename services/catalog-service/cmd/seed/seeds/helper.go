package seeds

import (
	"context"
	"log"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/mongo"
)

func Ptr[T any](v T) *T {
	return &v
}

func NewID() string {
	return uuid.New().String()
}

func ResetCollections(ctx context.Context, db *mongo.Database) {
	collections := []string{
		"categories",
		"products",
		"product_variants",
		"prices",
		"inventories",
		"product_images",
		"product_discounts",
		"eco_attributes",
		"active_prices",
		"favorite_products",
		"product_reviews",
		"review_replies",
		"product_ratings",
		"product_views",
		"product_analytics",
	}
	for _, col := range collections {
		if err := db.Collection(col).Drop(ctx); err != nil {
			log.Printf("⚠️  Drop %s: %v", col, err)
			continue
		}
		log.Printf("   dropped: %s", col)
	}
}
