package seeds

import (
	"catalog-service/databases"
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func SeedProducts(ctx context.Context, db *mongo.Database, catIDs map[string]string) []string {
	col := db.Collection("products")
	now := time.Now()

	shopIDs := []string{
		"shop-elektronik-001",
		"shop-fashion-001",
		"shop-kuliner-001",
		"shop-sport-001",
		"shop-beauty-001",
	}

	products := []databases.Product{
		{
			Base:          databases.Base{ID: "prod-001", CreatedAt: now, UpdatedAt: now},
			ShopID:        shopIDs[0],
			CategoryID:    catIDs["hp-tablet"],
			Name:          "Samsung Galaxy A55 5G",
			Slug:          "samsung-galaxy-a55-5g",
			Description:   "Smartphone flagship dengan layar Super AMOLED 6.6 inci dan kamera 50MP",
			SKU:           "SKU-HP-001",
			FavoriteCount: 245,
			ReviewCount:   89,
			RatingAverage: 4.7,
			IsActive:      true,
		},
		{
			Base:          databases.Base{ID: "prod-002", CreatedAt: now, UpdatedAt: now},
			ShopID:        shopIDs[0],
			CategoryID:    catIDs["audio-headphone"],
			Name:          "Headphone Bluetooth Sony WH-1000XM5",
			Slug:          "headphone-sony-wh1000xm5",
			Description:   "Headphone noise cancelling terbaik dengan battery 30 jam",
			SKU:           "SKU-AUD-001",
			FavoriteCount: 178,
			ReviewCount:   64,
			RatingAverage: 4.9,
			IsActive:      true,
		},
		{
			Base:          databases.Base{ID: "prod-003", CreatedAt: now, UpdatedAt: now},
			ShopID:        shopIDs[0],
			CategoryID:    catIDs["elektronik"],
			Name:          "Smart Watch Series 8 Pro",
			Slug:          "smart-watch-series-8-pro",
			Description:   "Smartwatch dengan fitur kesehatan lengkap dan GPS built-in",
			SKU:           "SKU-SW-001",
			FavoriteCount: 312,
			ReviewCount:   102,
			RatingAverage: 4.6,
			IsActive:      true,
		},
		{
			Base:          databases.Base{ID: "prod-004", CreatedAt: now, UpdatedAt: now},
			ShopID:        shopIDs[1],
			CategoryID:    catIDs["pakaian-wanita"],
			Name:          "Dress Batik Modern Motif Parang",
			Slug:          "dress-batik-modern-parang",
			Description:   "Dress batik modern dengan motif parang klasik, cocok untuk acara formal",
			SKU:           "SKU-DRS-001",
			FavoriteCount: 156,
			ReviewCount:   43,
			RatingAverage: 4.5,
			IsActive:      true,
		},
		{
			Base:          databases.Base{ID: "prod-005", CreatedAt: now, UpdatedAt: now},
			ShopID:        shopIDs[1],
			CategoryID:    catIDs["pakaian-pria"],
			Name:          "Kemeja Flanel Premium Pria",
			Slug:          "kemeja-flanel-premium-pria",
			Description:   "Kemeja flanel premium bahan katun 100% nyaman dipakai sehari-hari",
			SKU:           "SKU-KMJ-001",
			FavoriteCount: 98,
			ReviewCount:   37,
			RatingAverage: 4.4,
			IsActive:      true,
		},
		{
			Base:          databases.Base{ID: "prod-006", CreatedAt: now, UpdatedAt: now},
			ShopID:        shopIDs[2],
			CategoryID:    catIDs["kuliner"],
			Name:          "Rendang Daging Sapi Premium 500gr",
			Slug:          "rendang-daging-sapi-premium-500gr",
			Description:   "Rendang daging sapi asli Padang dengan bumbu rempah pilihan",
			SKU:           "SKU-RND-001",
			FavoriteCount: 421,
			ReviewCount:   187,
			RatingAverage: 4.8,
			IsActive:      true,
		},
		{
			Base:          databases.Base{ID: "prod-007", CreatedAt: now, UpdatedAt: now},
			ShopID:        shopIDs[2],
			CategoryID:    catIDs["kuliner"],
			Name:          "Kopi Arabika Gayo Aceh 250gr",
			Slug:          "kopi-arabika-gayo-aceh-250gr",
			Description:   "Kopi arabika single origin dari dataran tinggi Gayo Aceh",
			SKU:           "SKU-KPI-001",
			FavoriteCount: 289,
			ReviewCount:   134,
			RatingAverage: 4.7,
			IsActive:      true,
		},
		{
			Base:          databases.Base{ID: "prod-008", CreatedAt: now, UpdatedAt: now},
			ShopID:        shopIDs[3],
			CategoryID:    catIDs["olahraga"],
			Name:          "Sepatu Running Nike Air Zoom Pegasus",
			Slug:          "sepatu-running-nike-air-zoom-pegasus",
			Description:   "Sepatu lari dengan teknologi Air Zoom untuk kenyamanan maksimal",
			SKU:           "SKU-SPT-001",
			FavoriteCount: 534,
			ReviewCount:   221,
			RatingAverage: 4.8,
			IsActive:      true,
		},
		{
			Base:          databases.Base{ID: "prod-009", CreatedAt: now, UpdatedAt: now},
			ShopID:        shopIDs[4],
			CategoryID:    catIDs["skincare"],
			Name:          "Serum Vitamin C Brightening 30ml",
			Slug:          "serum-vitamin-c-brightening-30ml",
			Description:   "Serum vitamin C 20% untuk mencerahkan dan meratakan warna kulit",
			SKU:           "SKU-SRM-001",
			FavoriteCount: 678,
			ReviewCount:   312,
			RatingAverage: 4.9,
			IsActive:      true,
		},
		{
			Base:          databases.Base{ID: "prod-010", CreatedAt: now, UpdatedAt: now},
			ShopID:        shopIDs[4],
			CategoryID:    catIDs["kecantikan"],
			Name:          "Sunscreen SPF 50 PA++++ 50ml",
			Slug:          "sunscreen-spf50-pa-plus-50ml",
			Description:   "Sunscreen ringan non-greasy dengan perlindungan SPF 50 PA++++",
			SKU:           "SKU-SUN-001",
			FavoriteCount: 892,
			ReviewCount:   445,
			RatingAverage: 4.9,
			IsActive:      true,
		},
	}

	ids := []string{}
	for _, p := range products {
		filter := bson.M{"_id": p.ID}
		update := bson.M{"$setOnInsert": p}
		opts := options.Update().SetUpsert(true)
		if _, err := col.UpdateOne(ctx, filter, update, opts); err != nil {
			log.Printf("⚠️  Product %s: %v", p.Name, err)
			continue
		}
		ids = append(ids, p.ID)
	}

	log.Printf("✅ Products seeded (%d)", len(products))
	return ids
}
