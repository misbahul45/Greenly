package seeds

import (
	"context"
	"log"

	"github.com/lucsky/cuid"
	"go.mongodb.org/mongo-driver/mongo"
)

func Ptr[T any](v T) *T {
	return &v
}

func NewID() string {
	return cuid.New()
}

func ResetCollections(ctx context.Context, db *mongo.Database) {
	collections := []string{
		"categories",
		"products",
		"prices",
		"inventories",
		"product_images",
		"product_discounts",
		"eco_attributes",
		"active_prices",
	}
	for _, col := range collections {
		if err := db.Collection(col).Drop(ctx); err != nil {
			log.Printf("⚠️  Drop %s: %v", col, err)
			continue
		}
		log.Printf("   dropped: %s", col)
	}
}
