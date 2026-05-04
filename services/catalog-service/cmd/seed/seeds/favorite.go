package seeds

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

func SeedFavoriteProducts(ctx context.Context, db *mongo.Database, productIDs []string, shopIDs []string, userIDs []string) {
	col := db.Collection("favorite_products")
	now := time.Now()

	docs := make([]interface{}, 0)
	seen := map[string]bool{}

	pairs := [][2]int{
		{0, 0}, {0, 2}, {0, 5}, {0, 8}, {0, 15},
		{1, 1}, {1, 3}, {1, 6}, {1, 9}, {1, 16},
		{2, 0}, {2, 4}, {2, 7}, {2, 10}, {2, 17},
		{3, 2}, {3, 5}, {3, 8}, {3, 11}, {3, 18},
		{4, 1}, {4, 4}, {4, 6}, {4, 12}, {4, 19},
		{5, 3}, {5, 7}, {5, 9}, {5, 13}, {5, 20},
		{6, 0}, {6, 5}, {6, 10}, {6, 14}, {6, 21},
		{7, 2}, {7, 6}, {7, 11}, {7, 15}, {7, 22},
		{8, 1}, {8, 4}, {8, 8}, {8, 16}, {8, 23},
		{9, 3}, {9, 7}, {9, 12}, {9, 17}, {9, 24},
	}

	for _, p := range pairs {
		uIdx := p[0] % len(userIDs)
		pIdx := p[1] % len(productIDs)
		key := userIDs[uIdx] + ":" + productIDs[pIdx]
		if seen[key] {
			continue
		}
		seen[key] = true

		sIdx := pIdx % len(shopIDs)
		docs = append(docs, map[string]interface{}{
			"_id":        NewID(),
			"user_id":    userIDs[uIdx],
			"product_id": productIDs[pIdx],
			"shop_id":    shopIDs[sIdx],
			"created_at": now,
			"updated_at": now,
			"deleted_at": nil,
		})
	}

	if _, err := col.InsertMany(ctx, docs); err != nil {
		log.Printf("⚠️  Favorite products insert: %v", err)
	}
	log.Printf("✅ Favorite products seeded (%d)", len(docs))
}
