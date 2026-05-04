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
		{4.7, 89, 1, 2, 4, 15, 67},
		{4.9, 201, 0, 1, 3, 18, 179},
		{4.6, 74, 1, 2, 5, 12, 54},
		{4.5, 52, 1, 2, 6, 10, 33},
		{4.8, 118, 0, 1, 4, 16, 97},
		{4.9, 64, 0, 0, 2, 8, 54},
		{4.7, 93, 1, 1, 5, 14, 72},
		{4.8, 41, 0, 1, 2, 6, 32},
		{4.5, 43, 1, 2, 5, 9, 26},
		{4.6, 38, 0, 1, 4, 8, 25},
		{4.7, 87, 1, 1, 5, 14, 66},
		{4.4, 37, 1, 3, 5, 8, 20},
		{4.5, 56, 1, 2, 6, 11, 36},
		{4.8, 91, 0, 1, 3, 13, 74},
		{4.4, 62, 1, 3, 7, 12, 39},
		{4.6, 34, 0, 1, 4, 7, 22},
		{4.8, 187, 1, 2, 5, 24, 155},
		{4.7, 134, 1, 2, 6, 18, 107},
		{4.8, 142, 0, 1, 5, 20, 116},
		{4.6, 87, 1, 2, 7, 14, 63},
		{4.5, 61, 1, 2, 7, 12, 39},
		{4.8, 221, 1, 2, 6, 28, 184},
		{4.7, 312, 2, 3, 10, 42, 255},
		{4.6, 98, 1, 2, 8, 16, 71},
		{4.7, 134, 1, 2, 7, 18, 106},
		{4.8, 189, 1, 1, 5, 24, 158},
		{4.9, 312, 0, 1, 4, 28, 279},
		{4.8, 241, 1, 1, 5, 30, 204},
		{4.7, 167, 1, 2, 7, 22, 135},
		{4.9, 445, 1, 2, 6, 40, 396},
		{4.6, 198, 1, 3, 10, 30, 154},
		{4.7, 234, 1, 2, 9, 32, 190},
		{4.6, 123, 1, 2, 8, 18, 94},
		{4.5, 98, 1, 3, 9, 16, 69},
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
		1240, 3560, 890, 670, 2100, 1780, 2340, 450,
		980, 760, 1320, 540, 870, 2100, 1050, 430,
		3200, 2780, 1890, 1340, 980, 4500, 5600, 1230,
		2100, 3400, 5670, 4320, 3210, 7800, 3450, 4560,
		2340, 1980,
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
