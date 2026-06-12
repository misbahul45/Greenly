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
		{250, 10, 20, "Gudang Jakarta Selatan"},  // botol stainless
		{180, 8,  15, "Gudang Jakarta Selatan"},  // tumbler bambu
		{500, 20, 30, "Gudang Jakarta Barat"},    // tas kanvas
		{120, 5,  10, "Gudang Jakarta Barat"},    // tas bambu
		{800, 30, 50, "Gudang Jakarta Selatan"},  // sedotan stainless
		{350, 15, 25, "Gudang Jakarta Selatan"},  // peralatan makan bambu
		{200, 8,  15, "Gudang Jakarta Barat"},    // lilin soy wax
		{450, 18, 30, "Gudang Jakarta Barat"},    // lap microfiber
		{80,  3,  8,  "Gudang Jakarta Selatan"},  // rak bambu
		{300, 12, 20, "Gudang Bandung"},           // kaos katun organik
		{200, 8,  15, "Gudang Bandung"},           // celana linen
		{100, 4,  10, "Gudang Bandung"},           // jaket hemp
		{150, 6,  12, "Gudang Bandung"},           // topi bambu
		{200, 8,  15, "Gudang Bandung"},           // dompet cork
		{80,  3,  8,  "Gudang Bandung"},           // kacamata bambu
		{600, 25, 40, "Gudang Surabaya"},          // beras organik
		{400, 15, 25, "Gudang Surabaya"},          // teh hijau
		{250, 10, 20, "Gudang Surabaya"},          // madu hutan
		{350, 14, 25, "Gudang Surabaya"},          // granola
		{300, 12, 20, "Gudang Surabaya"},          // kopi flores
		{100, 4,  10, "Gudang Surabaya"},          // kit hidroponik
		{500, 20, 35, "Gudang Surabaya"},          // pupuk organik
		{350, 15, 25, "Gudang Semarang"},          // serum rosehip
		{280, 12, 20, "Gudang Semarang"},          // pelembab shea
		{420, 18, 30, "Gudang Semarang"},          // toner rose water
		{500, 22, 35, "Gudang Semarang"},          // sunscreen mineral
		{600, 25, 40, "Gudang Semarang"},          // sikat gigi bambu
		{800, 35, 50, "Gudang Semarang"},          // sabun batang
		{450, 18, 30, "Gudang Semarang"},          // sampo padat
		{60,  2,  6,  "Gudang Jakarta Barat"},    // panel surya
		{180, 8,  15, "Gudang Jakarta Barat"},    // lampu LED
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
