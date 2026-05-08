package seeds

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

func SeedProductDiscounts(ctx context.Context, db *mongo.Database, productIDs []string) {
	col := db.Collection("product_discounts")
	now := time.Now()
	future := time.Date(2026, 12, 31, 23, 59, 59, 0, time.UTC)
	past := time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC)

	type discountDef struct {
		name        string
		percentage  float64
		fixedAmount float64
	}

	defs := []discountDef{
		{"Promo Gadget Fest 10%", 10, 0},
		{"Flash Sale Harbolnas 15%", 15, 0},
		{"Diskon Pelanggan Baru 20%", 20, 0},
		{"Promo Akhir Tahun 12%", 12, 0},
		{"Flash Sale Weekend 8%", 8, 0},
		{"Diskon Audio Premium 15%", 15, 0},
		{"Promo Bundle Hemat 10%", 10, 0},
		{"Flash Sale Kamera 18%", 18, 0},
		{"Promo Fashion Week 20%", 20, 0},
		{"Diskon Tenun Nusantara 15%", 15, 0},
		{"Promo Kebaya Spesial 10%", 10, 0},
		{"Diskon Kemeja Pria 10%", 10, 0},
		{"Promo Batik Nasional 12%", 12, 0},
		{"Flash Sale Tas Branded 25%", 25, 0},
		{"Diskon Sepatu Wanita 15%", 15, 0},
		{"Promo Formal Wear 10%", 10, 0},
		{"Promo Kuliner Nusantara", 0, 15000},
		{"Diskon Kopi Spesial 5%", 5, 0},
		{"Flash Sale Sambal 10%", 10, 0},
		{"Promo Snack Lokal 8%", 8, 0},
		{"Diskon Oleh-oleh 12%", 12, 0},
		{"Sale Sepatu Olahraga 12%", 12, 0},
		{"Promo Jersey Timnas 10%", 10, 0},
		{"Flash Sale Fitness 20%", 20, 0},
		{"Diskon Yoga Equipment 15%", 15, 0},
		{"Promo Suplemen Gym 10%", 10, 0},
		{"Promo Skincare 25%", 25, 0},
		{"Flash Sale Moisturizer 20%", 20, 0},
		{"Diskon Toner Spesial 15%", 15, 0},
		{"Diskon Sunscreen 15%", 15, 0},
		{"Promo Makeup Bundle 18%", 18, 0},
		{"Flash Sale Lip Product 20%", 20, 0},
		{"Diskon Haircare 12%", 12, 0},
		{"Promo Perawatan Rambut 10%", 10, 0},
	}

	docs := make([]interface{}, 0, len(productIDs))
	for i, productID := range productIDs {
		d := defs[i%len(defs)]
		docs = append(docs, map[string]interface{}{
			"_id":          NewID(),
			"product_id":   productID,
			"name":         d.name,
			"percentage":   d.percentage,
			"fixed_amount": d.fixedAmount,
			"valid_from":   past,
			"valid_to":     future,
			"is_active":    true,
			"created_at":   now,
			"updated_at":   now,
			"deleted_at":   nil,
		})
	}

	if _, err := col.InsertMany(ctx, docs); err != nil {
		log.Printf("⚠️  Product discounts insert: %v", err)
	}
	log.Printf("✅ Product discounts seeded (%d)", len(docs))
}
