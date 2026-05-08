package seeds

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

func SeedInventories(ctx context.Context, db *mongo.Database, productIDs []string) {
	col := db.Collection("inventories")
	now := time.Now()

	type invDef struct {
		stock     int
		reserved  int
		threshold int
		location  string
	}

	defs := []invDef{
		{150, 5, 10, "Gudang Jakarta Barat"},
		{80, 3, 5, "Gudang Jakarta Selatan"},
		{60, 2, 5, "Gudang Jakarta Barat"},
		{45, 1, 5, "Gudang Jakarta Timur"},
		{30, 2, 5, "Gudang Jakarta Barat"},
		{200, 12, 15, "Gudang Jakarta Selatan"},
		{120, 8, 10, "Gudang Jakarta Barat"},
		{25, 1, 3, "Gudang Jakarta Selatan"},
		{75, 2, 10, "Gudang Bandung"},
		{90, 4, 10, "Gudang Bandung"},
		{55, 3, 5, "Gudang Bandung"},
		{120, 8, 10, "Gudang Bandung"},
		{100, 6, 10, "Gudang Bandung"},
		{65, 4, 5, "Gudang Bandung"},
		{40, 2, 5, "Gudang Bandung"},
		{35, 1, 5, "Gudang Bandung"},
		{50, 0, 5, "Gudang Surabaya"},
		{300, 15, 20, "Gudang Surabaya"},
		{180, 10, 15, "Gudang Surabaya"},
		{250, 12, 20, "Gudang Surabaya"},
		{150, 8, 10, "Gudang Surabaya"},
		{60, 4, 5, "Gudang Yogyakarta"},
		{400, 25, 30, "Gudang Yogyakarta"},
		{70, 5, 10, "Gudang Yogyakarta"},
		{500, 30, 40, "Gudang Semarang"},
		{350, 20, 25, "Gudang Semarang"},
		{250, 20, 25, "Gudang Semarang"},
		{320, 18, 25, "Gudang Semarang"},
		{280, 15, 20, "Gudang Semarang"},
		{400, 30, 30, "Gudang Semarang"},
		{380, 22, 30, "Gudang Semarang"},
		{450, 28, 35, "Gudang Semarang"},
		{290, 16, 20, "Gudang Semarang"},
		{310, 19, 25, "Gudang Semarang"},
	}

	docs := make([]interface{}, 0, len(productIDs))
	for i, productID := range productIDs {
		d := defs[i%len(defs)]
		docs = append(docs, map[string]interface{}{
			"_id":                 NewID(),
			"product_id":          productID,
			"stock":               d.stock,
			"reserved_stock":      d.reserved,
			"low_stock_threshold": d.threshold,
			"location":            d.location,
			"created_at":          now,
			"updated_at":          now,
			"deleted_at":          nil,
		})
	}

	if _, err := col.InsertMany(ctx, docs); err != nil {
		log.Printf("⚠️  Inventories insert: %v", err)
	}
	log.Printf("✅ Inventories seeded (%d)", len(docs))
}
