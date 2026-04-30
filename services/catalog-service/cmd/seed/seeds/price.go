package seeds

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

func SeedPrices(ctx context.Context, db *mongo.Database, productIDs []string) {
	col := db.Collection("prices")
	now := time.Now()

	amounts := []float64{
		4999000,
		18999000,
		8499000,
		6799000,
		17999000,
		3500000,
		1299000,
		24999000,
		280000,
		350000,
		750000,
		195000,
		225000,
		899000,
		650000,
		580000,
		120000,
		95000,
		45000,
		35000,
		28000,
		1450000,
		350000,
		2800000,
		185000,
		450000,
		220000,
		189000,
		165000,
		180000,
		125000,
		89000,
		175000,
		145000,
	}

	docs := make([]interface{}, 0, len(productIDs))
	for i, productID := range productIDs {
		amount := amounts[i%len(amounts)]
		docs = append(docs, map[string]interface{}{
			"_id":        NewID(),
			"product_id": productID,
			"amount":     amount,
			"currency":   "IDR",
			"created_at": now,
			"updated_at": now,
			"deleted_at": nil,
		})
	}

	if _, err := col.InsertMany(ctx, docs); err != nil {
		log.Printf("⚠️  Prices insert: %v", err)
	}
	log.Printf("✅ Prices seeded (%d)", len(docs))
}
