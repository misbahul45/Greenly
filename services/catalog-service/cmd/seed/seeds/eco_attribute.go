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
		{1.2, true, "recycled",       85.0},
		{0.8, true, "bamboo",         92.0},
		{0.5, true, "organic_cotton", 88.0},
		{0.6, true, "bamboo",         94.0},
		{0.4, true, "recycled",       87.0},
		{0.5, true, "bamboo",         93.0},
		{0.3, true, "organic_cotton", 90.0},
		{0.4, true, "recycled",       82.0},
		{0.6, true, "bamboo",         91.0},
		{1.0, true, "organic_cotton", 90.0},
		{1.1, true, "linen",          88.0},
		{1.3, true, "hemp",           86.0},
		{0.4, true, "bamboo",         92.0},
		{0.3, true, "wood",           87.0},
		{0.5, true, "bamboo",         90.0},
		{0.2, true, "organic_cotton", 98.0},
		{0.1, true, "organic_cotton", 97.0},
		{0.1, true, "organic_cotton", 99.0},
		{0.3, true, "organic_cotton", 94.0},
		{0.2, true, "organic_cotton", 96.0},
		{0.5, true, "recycled",       85.0},
		{0.2, true, "recycled",       94.0},
		{0.4, true, "organic_cotton", 93.0},
		{0.5, true, "organic_cotton", 91.0},
		{0.3, true, "organic_cotton", 92.0},
		{0.6, true, "recycled",       88.0},
		{0.3, true, "bamboo",         95.0},
		{0.2, true, "organic_cotton", 96.0},
		{0.4, true, "recycled",       92.0},
		{2.5, true, "recycled",       85.0},
		{1.8, true, "recycled",       82.0},
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
