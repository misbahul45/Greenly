package seeds

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func SeedEcoAttributes(ctx context.Context, db *mongo.Database) {
	col := db.Collection("eco_attributes")
	now := time.Now()

	type ecoData struct {
		id              string
		productID       string
		carbonFootprint float64
		recyclable      bool
		materialType    string
		ecoScore        float64
	}

	ecoAttrs := []ecoData{
		{"eco-001", "prod-001", 12.5, false, "Plastik & Metal", 3.2},
		{"eco-002", "prod-002", 8.3, true, "Plastik Daur Ulang", 6.5},
		{"eco-003", "prod-003", 10.1, false, "Metal & Kaca", 4.0},
		{"eco-004", "prod-004", 2.1, true, "Katun Organik", 8.7},
		{"eco-005", "prod-005", 3.4, true, "Katun 100%", 7.9},
		{"eco-006", "prod-006", 1.2, true, "Bahan Alami", 9.5},
		{"eco-007", "prod-007", 0.8, true, "Bahan Alami", 9.8},
		{"eco-008", "prod-008", 6.7, false, "Karet & Foam Sintetis", 4.5},
		{"eco-009", "prod-009", 1.5, true, "Bahan Aktif Alami", 8.2},
		{"eco-010", "prod-010", 1.8, true, "Mineral & Bahan Alami", 8.6},
	}

	for _, e := range ecoAttrs {
		doc := bson.M{
			"_id":              e.id,
			"product_id":       e.productID,
			"carbon_footprint": e.carbonFootprint,
			"recyclable":       e.recyclable,
			"material_type":    e.materialType,
			"eco_score":        e.ecoScore,
			"created_at":       now,
			"updated_at":       now,
			"deleted_at":       nil,
		}
		filter := bson.M{"_id": doc["_id"]}
		update := bson.M{"$setOnInsert": doc}
		opts := options.Update().SetUpsert(true)
		if _, err := col.UpdateOne(ctx, filter, update, opts); err != nil {
			log.Printf("⚠️  EcoAttribute %s: %v", e.id, err)
		}
	}

	log.Printf("✅ Eco attributes seeded (%d)", len(ecoAttrs))
}
