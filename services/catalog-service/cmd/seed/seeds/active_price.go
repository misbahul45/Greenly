package seeds

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func SeedActivePrices(ctx context.Context, db *mongo.Database) {
	col := db.Collection("active_prices")
	now := time.Now()

	activePrices := []struct {
		productID  string
		finalPrice float64
	}{
		{"prod-001", 4499100},
		{"prod-002", 2975000},
		{"prod-003", 1050000},
		{"prod-004", 224000},
		{"prod-005", 175500},
		{"prod-006", 105000},
		{"prod-007", 90250},
		{"prod-008", 1276000},
		{"prod-009", 165000},
		{"prod-010", 153000},
	}

	for _, ap := range activePrices {
		doc := bson.M{
			"_id":         "ap-" + ap.productID,
			"product_id":  ap.productID,
			"final_price": ap.finalPrice,
			"updated_at":  now,
		}
		filter := bson.M{"_id": doc["_id"]}
		update := bson.M{"$setOnInsert": doc}
		opts := options.Update().SetUpsert(true)
		if _, err := col.UpdateOne(ctx, filter, update, opts); err != nil {
			log.Printf("⚠️  ActivePrice %s: %v", ap.productID, err)
		}
	}

	log.Printf("✅ Active prices seeded (%d)", len(activePrices))
}
