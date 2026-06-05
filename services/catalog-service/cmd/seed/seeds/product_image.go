package seeds

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

func SeedProductImages(ctx context.Context, db *mongo.Database, productIDs []string) {
	col := db.Collection("product_images")
	now := time.Now()

	queries := []string{
		"stainless-steel-bottle,sustainable",
		"bamboo-tumbler,eco-friendly",
		"canvas-tote-bag,reusable",
		"bamboo-bag,natural-weave",
		"metal-straw,zero-waste",
		"bamboo-cutlery-set,eco",
		"soy-candle,aromatherapy",
		"microfiber-cloth,eco-cleaning",
		"bamboo-shelf,minimalist",
		"organic-cotton-shirt,sustainable",
		"linen-pants,natural-fabric",
		"hemp-jacket,eco-fashion",
		"bamboo-hat,beach-natural",
		"cork-wallet,vegan-leather",
		"bamboo-glasses,handcrafted",
		"organic-rice,paddy-field",
		"green-tea,tea-leaves-organic",
		"raw-honey,forest-kalimantan",
		"granola,oat-organic",
		"arabica-coffee,organic-beans",
		"hydroponics,indoor-garden",
		"liquid-fertilizer,organic",
		"rosehip-serum,skincare-natural",
		"shea-butter,moisturizer-organic",
		"rose-water,toner-natural",
		"mineral-sunscreen,zinc-oxide",
		"bamboo-toothbrush,charcoal",
		"natural-soap,lavender-organic",
		"shampoo-bar,zero-waste",
		"portable-solar-panel,camping",
		"led-bulb,energy-saving",
	}

	docs := make([]interface{}, 0)

	for i, productID := range productIDs {
		query := queries[i%len(queries)]

		for j := 0; j < 3; j++ {
			docs = append(docs, map[string]interface{}{
				"_id":         NewID(),
				"product_id":  productID,
				"product_key": productID,
				"url":         fmt.Sprintf("https://source.unsplash.com/800x800/?%s&sig=%d", query, j),
				"file_id":     NewID(),
				"is_primary":  j == 0,
				"order":       j,
				"created_at":  now,
				"updated_at":  now,
				"deleted_at":  nil,
			})
		}
	}

	if _, err := col.InsertMany(ctx, docs); err != nil {
		log.Printf("⚠️  Product images insert: %v", err)
	}

	log.Printf("✅ Product images seeded (%d)", len(docs))
}
