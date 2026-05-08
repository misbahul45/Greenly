package seeds

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

func SeedEcoAttributes(ctx context.Context, db *mongo.Database, productIDs []string) {
	col := db.Collection("eco_attributes")
	now := time.Now()

	type ecoDef struct {
		carbonFootprint float64
		recyclable      bool
		materialType    string
		ecoScore        float64
	}

	defs := []ecoDef{
		{12.5, false, "Plastik & Metal", 3.2},
		{15.8, false, "Aluminium & Kaca", 2.8},
		{11.2, false, "Metal & Plastik", 3.5},
		{9.4, false, "Plastik Daur Ulang & Metal", 4.1},
		{18.3, false, "Aluminium & Plastik", 2.5},
		{8.3, true, "Plastik Daur Ulang", 6.5},
		{7.1, true, "Plastik Daur Ulang", 6.8},
		{14.6, false, "Metal & Kaca", 3.0},
		{2.1, true, "Katun Organik", 8.7},
		{3.8, true, "Serat Alam", 8.2},
		{2.5, true, "Sutra & Katun", 8.5},
		{3.4, true, "Katun 100%", 7.9},
		{2.8, true, "Katun Organik", 8.3},
		{4.2, true, "Kulit Nabati", 7.5},
		{3.9, true, "Kulit Nabati", 7.6},
		{4.5, false, "Kulit Sintetis", 5.8},
		{1.2, true, "Bahan Alami", 9.5},
		{0.8, true, "Biji Kopi Organik", 9.8},
		{0.6, true, "Bahan Alami Segar", 9.9},
		{1.5, true, "Kedelai Organik", 9.2},
		{0.9, true, "Bahan Alami Tradisional", 9.6},
		{6.7, false, "Karet & Foam Sintetis", 4.5},
		{3.2, true, "Polyester Daur Ulang", 7.0},
		{5.8, false, "Besi & Karet", 4.8},
		{2.4, true, "Karet Alam & TPE", 8.0},
		{1.8, true, "Whey Protein Alami", 8.4},
		{1.5, true, "Bahan Aktif Alami", 8.2},
		{1.3, true, "Hyaluronic Acid Alami", 8.6},
		{1.6, true, "BHA Alami", 8.1},
		{1.8, true, "Mineral & Bahan Alami", 8.6},
		{2.2, false, "Bahan Kimia Kosmetik", 6.2},
		{1.4, true, "Pigmen Alami", 8.3},
		{1.1, true, "Argan Oil Organik", 9.0},
		{1.3, true, "Keratin Alami", 8.7},
	}

	docs := make([]interface{}, 0, len(productIDs))
	for i, productID := range productIDs {
		d := defs[i%len(defs)]
		docs = append(docs, map[string]interface{}{
			"_id":              NewID(),
			"product_id":       productID,
			"carbon_footprint": d.carbonFootprint,
			"recyclable":       d.recyclable,
			"material_type":    d.materialType,
			"eco_score":        d.ecoScore,
			"created_at":       now,
			"updated_at":       now,
			"deleted_at":       nil,
		})
	}

	if _, err := col.InsertMany(ctx, docs); err != nil {
		log.Printf("⚠️  Eco attributes insert: %v", err)
	}
	log.Printf("✅ Eco attributes seeded (%d)", len(docs))
}
