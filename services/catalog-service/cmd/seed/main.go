package main

import (
	"catalog-service/cmd/seed/seeds"
	"catalog-service/databases"
	"context"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	mongoURI := os.Getenv("MONGODB_URL")
	if mongoURI == "" {
		mongoURI = "mongodb://root:root@localhost:27017/catalog?authSource=admin"
	}

	client, err := databases.Connect(mongoURI)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer client.Disconnect(context.Background())

	db := client.Database("catalog")
	ctx := context.Background()

	userIDs := []string{
		seeds.NewID(), seeds.NewID(), seeds.NewID(), seeds.NewID(), seeds.NewID(),
		seeds.NewID(), seeds.NewID(), seeds.NewID(), seeds.NewID(), seeds.NewID(),
	}

	shopIDs := []string{
		seeds.NewID(), seeds.NewID(), seeds.NewID(), seeds.NewID(), seeds.NewID(),
	}

	log.Println("🗑️  Resetting collections...")
	seeds.ResetCollections(ctx, db)

	log.Println("🌱 Starting catalog seed...")

	categoryIDs := seeds.SeedCategories(ctx, db)
	productIDs := seeds.SeedProducts(ctx, db, categoryIDs)
	seeds.SeedProductVariants(ctx, db, productIDs)
	seeds.SeedPrices(ctx, db, productIDs)
	seeds.SeedInventories(ctx, db, productIDs)
	seeds.SeedProductImages(ctx, db, productIDs)
	seeds.SeedProductDiscounts(ctx, db, productIDs)
	seeds.SeedEcoAttributes(ctx, db, productIDs)
	seeds.SeedActivePrices(ctx, db, productIDs)
	seeds.SeedFavoriteProducts(ctx, db, productIDs, shopIDs, userIDs)
	reviewIDs := seeds.SeedProductReviews(ctx, db, productIDs, shopIDs, userIDs)
	seeds.SeedReviewReplies(ctx, db, reviewIDs, shopIDs)
	seeds.SeedProductRatings(ctx, db, productIDs)
	seeds.SeedProductViews(ctx, db, productIDs, userIDs)
	seeds.SeedProductAnalytics(ctx, db, productIDs)

	log.Println("🎉 Catalog seed completed successfully!")
}
