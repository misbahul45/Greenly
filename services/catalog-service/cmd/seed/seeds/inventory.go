package seeds

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func SeedInventories(ctx context.Context, db *mongo.Database) {
	col := db.Collection("inventories")
	now := time.Now()

	inventories := []struct {
		productID         string
		stock             int
		reservedStock     int
		lowStockThreshold int
		location          string
	}{
		{"prod-001", 150, 5, 10, "Gudang Jakarta Barat"},
		{"prod-002", 80, 3, 5, "Gudang Jakarta Selatan"},
		{"prod-003", 200, 12, 15, "Gudang Jakarta Barat"},
		{"prod-004", 75, 2, 10, "Gudang Bandung"},
		{"prod-005", 120, 8, 10, "Gudang Bandung"},
		{"prod-006", 50, 0, 5, "Gudang Surabaya"},
		{"prod-007", 300, 15, 20, "Gudang Surabaya"},
		{"prod-008", 60, 4, 5, "Gudang Yogyakarta"},
		{"prod-009", 250, 20, 25, "Gudang Semarang"},
		{"prod-010", 400, 30, 30, "Gudang Semarang"},
	}

	for _, inv := range inventories {
		doc := bson.M{
			"_id":                 "inv-" + inv.productID,
			"product_id":          inv.productID,
			"stock":               inv.stock,
			"reserved_stock":      inv.reservedStock,
			"low_stock_threshold": inv.lowStockThreshold,
			"location":            inv.location,
			"created_at":          now,
			"updated_at":          now,
			"deleted_at":          nil,
		}
		filter := bson.M{"_id": doc["_id"]}
		update := bson.M{"$setOnInsert": doc}
		opts := options.Update().SetUpsert(true)
		if _, err := col.UpdateOne(ctx, filter, update, opts); err != nil {
			log.Printf("⚠️  Inventory %s: %v", inv.productID, err)
		}
	}

	log.Printf("✅ Inventories seeded (%d)", len(inventories))
}
