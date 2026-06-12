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
		{"Promo Eco Living 10%", 10, 0},
		{"Flash Sale Green Product 15%", 15, 0},
		{"Diskon Pelanggan Baru Eco 20%", 20, 0},
		{"Promo Zero Waste Month 12%", 12, 0},
		{"Flash Sale Sustainable Week 8%", 8, 0},
		{"Diskon Eco Bundle 15%", 15, 0},
		{"Promo Aromaterapi Alami 10%", 10, 0},
		{"Flash Sale Rumah Eco 18%", 18, 0},
		{"Promo Furnitur Bambu 20%", 20, 0},
		{"Diskon Fashion Organik 15%", 15, 0},
		{"Promo Hemp & Linen Week 10%", 10, 0},
		{"Diskon Jaket Sustainable 12%", 12, 0},
		{"Flash Sale Aksesoris Eco 25%", 25, 0},
		{"Diskon Cork & Bambu 15%", 15, 0},
		{"Promo Kacamata Alami 10%", 10, 0},
		{"Promo Organik Nusantara", 0, 5000},
		{"Diskon Teh Hijau 5%", 5, 0},
		{"Flash Sale Madu Hutan 10%", 10, 0},
		{"Promo Granola Sehat 8%", 8, 0},
		{"Diskon Kopi Organik 12%", 12, 0},
		{"Sale Kit Berkebun 12%", 12, 0},
		{"Promo Pupuk Organik 10%", 10, 0},
		{"Promo Skincare Alami 25%", 25, 0},
		{"Flash Sale Shea Butter 25%", 25, 0},
		{"Diskon Toner Organik 20%", 20, 0},
		{"Diskon Sunscreen Natural 15%", 15, 0},
		{"Promo Sikat Gigi Eco 20%", 20, 0},
		{"Flash Sale Sabun Alami 20%", 20, 0},
		{"Diskon Sampo Padat 12%", 12, 0},
		{"Flash Sale Panel Surya 10%", 10, 0},
		{"Promo LED Hemat Energi 10%", 10, 0},
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
