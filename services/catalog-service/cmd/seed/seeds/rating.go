package seeds

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

func SeedProductRatings(ctx context.Context, db *mongo.Database, productIDs []string) {
	col := db.Collection("product_ratings")
	now := time.Now()

	type ratingDef struct {
		average   float64
		count     int
		oneStar   int
		twoStar   int
		threeStar int
		fourStar  int
		fiveStar  int
	}

	defs := []ratingDef{
		{4.8, 134, 0, 1, 4,  18, 111}, // botol stainless
		{4.7, 87,  1, 1, 5,  12, 68},  // tumbler bambu
		{4.8, 112, 0, 1, 4,  15, 92},  // tas kanvas
		{4.7, 76,  1, 1, 5,  10, 59},  // tas bambu
		{4.9, 187, 0, 0, 3,  20, 164}, // sedotan stainless
		{4.7, 115, 1, 1, 6,  15, 92},  // peralatan makan bambu
		{4.8, 82,  0, 1, 3,  10, 68},  // lilin soy wax
		{4.6, 58,  1, 1, 5,  8,  43},  // lap microfiber
		{4.7, 94,  1, 1, 5,  13, 74},  // rak bambu
		{4.8, 143, 0, 1, 4,  18, 120}, // kaos katun organik
		{4.7, 116, 1, 1, 6,  15, 93},  // celana linen
		{4.6, 82,  1, 1, 6,  11, 63},  // jaket hemp
		{4.7, 67,  1, 1, 4,  9,  52},  // topi bambu
		{4.8, 98,  0, 1, 3,  12, 82},  // dompet cork
		{4.6, 62,  1, 1, 5,  8,  47},  // kacamata bambu
		{4.9, 178, 0, 0, 3,  18, 157}, // beras organik
		{4.8, 134, 0, 1, 4,  16, 113}, // teh hijau
		{4.9, 165, 0, 1, 3,  18, 143}, // madu hutan
		{4.7, 124, 1, 1, 6,  16, 100}, // granola
		{4.8, 152, 0, 1, 4,  18, 129}, // kopi flores
		{4.7, 84,  1, 1, 5,  11, 66},  // kit hidroponik
		{4.6, 72,  1, 1, 6,  9,  55},  // pupuk organik
		{4.9, 226, 0, 1, 4,  24, 197}, // serum rosehip
		{4.8, 175, 0, 1, 4,  20, 150}, // pelembab shea
		{4.8, 161, 0, 1, 5,  18, 137}, // toner rose water
		{4.9, 265, 0, 1, 5,  28, 231}, // sunscreen mineral
		{4.9, 208, 0, 1, 4,  22, 181}, // sikat gigi bambu
		{4.8, 152, 0, 1, 4,  18, 129}, // sabun batang
		{4.7, 133, 1, 1, 6,  17, 108}, // sampo padat
		{4.7, 76,  1, 1, 5,  10, 59},  // panel surya
		{4.6, 98,  1, 1, 7,  13, 76},  // lampu LED
	}

	docs := make([]interface{}, 0, len(productIDs))
	for i, productID := range productIDs {
		d := defs[i%len(defs)]
		docs = append(docs, map[string]interface{}{
			"product_id": productID,
			"average":    d.average,
			"count":      d.count,
			"one_star":   d.oneStar,
			"two_star":   d.twoStar,
			"three_star": d.threeStar,
			"four_star":  d.fourStar,
			"five_star":  d.fiveStar,
			"updated_at": now,
		})
	}

	if _, err := col.InsertMany(ctx, docs); err != nil {
		log.Printf("⚠️  Product ratings insert: %v", err)
	}
	log.Printf("✅ Product ratings seeded (%d)", len(docs))
}

func SeedProductViews(ctx context.Context, db *mongo.Database, productIDs []string, userIDs []string) {
	col := db.Collection("product_views")
	now := time.Now()

	sources := []string{"web", "mobile", "search", "recommendation", "social"}

	docs := make([]interface{}, 0)
	for i, productID := range productIDs {
		numViews := 5 + (i % 6)
		for j := 0; j < numViews; j++ {
			var userID *string
			if j%3 != 0 {
				uid := userIDs[(i+j)%len(userIDs)]
				userID = &uid
			}
			docs = append(docs, map[string]interface{}{
				"_id":        NewID(),
				"product_id": productID,
				"user_id":    userID,
				"source":     sources[(i+j)%len(sources)],
				"created_at": now.Add(-time.Duration(j*2) * time.Hour),
				"updated_at": now.Add(-time.Duration(j*2) * time.Hour),
				"deleted_at": nil,
			})
		}
	}

	if _, err := col.InsertMany(ctx, docs); err != nil {
		log.Printf("⚠️  Product views insert: %v", err)
	}
	log.Printf("✅ Product views seeded (%d)", len(docs))
}

func SeedProductAnalytics(ctx context.Context, db *mongo.Database, productIDs []string) {
	col := db.Collection("product_analytics")
	now := time.Now()

	viewCounts := []int{
		2340, 1780, 4200, 1890, 5600, 2800, 1450, 3200, 1560,
		4800, 3400, 2100, 1890, 3200, 1560,
		6700, 4500, 5800, 3400, 4200, 1780, 3400,
		7800, 5600, 6200, 8900, 7500, 6700, 3800,
		2100, 3400,
	}

	docs := make([]interface{}, 0, len(productIDs))
	for i, productID := range productIDs {
		vc := viewCounts[i%len(viewCounts)]
		docs = append(docs, map[string]interface{}{
			"product_id":     productID,
			"view_count":     vc,
			"last_viewed_at": now.Add(-time.Duration(i) * time.Hour),
		})
	}

	if _, err := col.InsertMany(ctx, docs); err != nil {
		log.Printf("⚠️  Product analytics insert: %v", err)
	}
	log.Printf("✅ Product analytics seeded (%d)", len(docs))
}
