package seeds

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

func SeedActivePrices(ctx context.Context, db *mongo.Database, productIDs []string) {
	col := db.Collection("active_prices")
	now := time.Now()

	finalPrices := []float64{
		4499100,
		16149150,
		7224150,
		5983120,
		16559080,
		2975000,
		1104150,
		20249180,
		224000,
		297500,
		675000,
		175500,
		198000,
		674250,
		552500,
		522000,
		105000,
		90250,
		40500,
		32200,
		24640,
		1276000,
		315000,
		2240000,
		157250,
		405000,
		165000,
		151200,
		140250,
		153000,
		102500,
		71200,
		154000,
		130500,
	}

	docs := make([]interface{}, 0, len(productIDs))
	for i, productID := range productIDs {
		finalPrice := finalPrices[i%len(finalPrices)]
		docs = append(docs, map[string]interface{}{
			"_id":         NewID(),
			"product_id":  productID,
			"final_price": finalPrice,
			"updated_at":  now,
		})
	}

	if _, err := col.InsertMany(ctx, docs); err != nil {
		log.Printf("⚠️  Active prices insert: %v", err)
	}
	log.Printf("✅ Active prices seeded (%d)", len(docs))
}
