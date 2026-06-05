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
		{1.2, true, "Stainless Steel 304 Food Grade",       85.0},
		{0.8, true, "Bambu Organik Bersertifikat",           92.0},
		{0.5, true, "Katun Organik Daur Ulang",              88.0},
		{0.6, true, "Bambu Organik Anyaman",                 94.0},
		{0.4, true, "Stainless Steel 304 Food Grade",       87.0},
		{0.5, true, "Bambu Organik Natural",                 93.0},
		{0.3, true, "Soy Wax & Kapas Organik",              90.0},
		{0.4, true, "Serat Mikro Daur Ulang",               82.0},
		{0.6, true, "Bambu Solid Organik",                   91.0},
		{1.0, true, "Katun Organik GOTS Certified",         90.0},
		{1.1, true, "Linen Alami",                           88.0},
		{1.3, true, "Hemp Organik Bersertifikat",            86.0},
		{0.4, true, "Bambu Anyaman Organik",                 92.0},
		{0.3, true, "Cork Oak Biodegradable",                87.0},
		{0.5, true, "Bambu Solid Handcrafted",               90.0},
		{0.2, true, "Padi Organik Non-GMO",                  98.0},
		{0.1, true, "Daun Teh Organik Bersertifikat",        97.0},
		{0.1, true, "Madu Raw Unprocessed",                  99.0},
		{0.3, true, "Oat Organik & Buah Kering",             94.0},
		{0.2, true, "Biji Kopi Organik Rainforest Alliance", 96.0},
		{0.5, true, "Material Komposit Organik",             85.0},
		{0.2, true, "Fermentasi Organik NPK",                94.0},
		{0.4, true, "Minyak Rosehip Organik Murni",          93.0},
		{0.5, true, "Shea Butter & Jojoba Organik",          91.0},
		{0.3, true, "Air Mawar Organik Distilasi",           92.0},
		{0.6, true, "Zinc Oxide Mineral Non-Nano",           88.0},
		{0.3, true, "Bambu Organik & Arang Aktif",           95.0},
		{0.2, true, "Minyak Kelapa & Lavender Organik",      96.0},
		{0.4, true, "Formula Organik Zero Waste",            92.0},
		{2.5, true, "Panel Surya Crystalline Silicon",       85.0},
		{1.8, true, "LED Chip Bebas Merkuri",                82.0},
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
