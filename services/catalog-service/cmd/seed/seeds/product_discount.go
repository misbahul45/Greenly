package seeds

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func SeedProductDiscounts(ctx context.Context, db *mongo.Database) {
	col := db.Collection("product_discounts")
	now := time.Now()
	future := time.Date(2026, 12, 31, 23, 59, 59, 0, time.UTC)
	past := time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC)

	type discountData struct {
		id          string
		productID   string
		name        string
		percentage  float64
		fixedAmount float64
		isActive    bool
	}

	discounts := []discountData{
		{"disc-001", "prod-001", "Promo Gadget Fest 10%", 10, 0, true},
		{"disc-002", "prod-002", "Diskon Audio Premium 15%", 15, 0, true},
		{"disc-003", "prod-003", "Flash Sale Smartwatch", 0, 150000, true},
		{"disc-004", "prod-004", "Promo Fashion Week 20%", 20, 0, true},
		{"disc-005", "prod-005", "Diskon Kemeja Pria 10%", 10, 0, true},
		{"disc-006", "prod-006", "Promo Kuliner Nusantara", 0, 15000, true},
		{"disc-007", "prod-007", "Diskon Kopi Spesial 5%", 5, 0, true},
		{"disc-008", "prod-008", "Sale Sepatu Olahraga 12%", 12, 0, true},
		{"disc-009", "prod-009", "Promo Skincare 25%", 25, 0, true},
		{"disc-010", "prod-010", "Diskon Sunscreen 15%", 15, 0, true},
	}

	for _, d := range discounts {
		doc := bson.M{
			"_id":          d.id,
			"product_id":   d.productID,
			"name":         d.name,
			"percentage":   d.percentage,
			"fixed_amount": d.fixedAmount,
			"valid_from":   past,
			"valid_to":     future,
			"is_active":    d.isActive,
			"created_at":   now,
			"updated_at":   now,
			"deleted_at":   nil,
		}
		filter := bson.M{"_id": doc["_id"]}
		update := bson.M{"$setOnInsert": doc}
		opts := options.Update().SetUpsert(true)
		if _, err := col.UpdateOne(ctx, filter, update, opts); err != nil {
			log.Printf("⚠️  Discount %s: %v", d.id, err)
		}
	}

	log.Printf("✅ Product discounts seeded (%d)", len(discounts))
}
