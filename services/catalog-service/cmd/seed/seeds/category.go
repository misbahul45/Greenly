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

func SeedCategories(ctx context.Context, db *mongo.Database) map[string]string {
	col := db.Collection("categories")
	col.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "slug", Value: 1}},
			Options: options.Index().SetUnique(true).SetSparse(true),
		},
	})

	now := time.Now()

	categories := []databases.Category{
		{Base: databases.Base{ID: "cat-elektronik", CreatedAt: now, UpdatedAt: now}, Name: "Elektronik", Slug: "elektronik"},
		{Base: databases.Base{ID: "cat-fashion", CreatedAt: now, UpdatedAt: now}, Name: "Fashion", Slug: "fashion"},
		{Base: databases.Base{ID: "cat-kuliner", CreatedAt: now, UpdatedAt: now}, Name: "Kuliner", Slug: "kuliner"},
		{Base: databases.Base{ID: "cat-olahraga", CreatedAt: now, UpdatedAt: now}, Name: "Olahraga", Slug: "olahraga"},
		{Base: databases.Base{ID: "cat-kecantikan", CreatedAt: now, UpdatedAt: now}, Name: "Kecantikan", Slug: "kecantikan"},
		{Base: databases.Base{ID: "cat-hp-tablet", CreatedAt: now, UpdatedAt: now}, Name: "HP & Tablet", Slug: "hp-tablet", ParentID: Ptr("cat-elektronik")},
		{Base: databases.Base{ID: "cat-audio", CreatedAt: now, UpdatedAt: now}, Name: "Audio & Headphone", Slug: "audio-headphone", ParentID: Ptr("cat-elektronik")},
		{Base: databases.Base{ID: "cat-wanita", CreatedAt: now, UpdatedAt: now}, Name: "Pakaian Wanita", Slug: "pakaian-wanita", ParentID: Ptr("cat-fashion")},
		{Base: databases.Base{ID: "cat-pria", CreatedAt: now, UpdatedAt: now}, Name: "Pakaian Pria", Slug: "pakaian-pria", ParentID: Ptr("cat-fashion")},
		{Base: databases.Base{ID: "cat-skincare", CreatedAt: now, UpdatedAt: now}, Name: "Skincare", Slug: "skincare", ParentID: Ptr("cat-kecantikan")},
	}

	ids := map[string]string{}
	for _, cat := range categories {
		filter := bson.M{"_id": cat.ID}
		update := bson.M{"$setOnInsert": cat}
		opts := options.Update().SetUpsert(true)
		if _, err := col.UpdateOne(ctx, filter, update, opts); err != nil {
			log.Printf("⚠️  Category %s: %v", cat.Name, err)
			continue
		}
		ids[cat.Slug] = cat.ID
	}

	log.Printf("✅ Categories seeded (%d)", len(categories))
	return ids
}
