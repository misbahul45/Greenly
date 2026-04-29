package seeds

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func SeedPrices(ctx context.Context, db *mongo.Database) {
	col := db.Collection("prices")
	now := time.Now()

	prices := []struct {
		productID string
		amount    float64
		currency  string
	}{
		{"prod-001", 4999000, "IDR"},
		{"prod-002", 3500000, "IDR"},
		{"prod-003", 1200000, "IDR"},
		{"prod-004", 280000, "IDR"},
		{"prod-005", 195000, "IDR"},
		{"prod-006", 120000, "IDR"},
		{"prod-007", 95000, "IDR"},
		{"prod-008", 1450000, "IDR"},
		{"prod-009", 220000, "IDR"},
		{"prod-010", 180000, "IDR"},
	}

	for _, p := range prices {
		doc := bson.M{
			"_id":        "price-" + p.productID,
			"product_id": p.productID,
			"amount":     p.amount,
			"currency":   p.currency,
			"created_at": now,
			"updated_at": now,
			"deleted_at": nil,
		}
		filter := bson.M{"_id": doc["_id"]}
		update := bson.M{"$setOnInsert": doc}
		opts := options.Update().SetUpsert(true)
		if _, err := col.UpdateOne(ctx, filter, update, opts); err != nil {
			log.Printf("⚠️  Price %s: %v", p.productID, err)
		}
	}

	log.Printf("✅ Prices seeded (%d)", len(prices))
}
