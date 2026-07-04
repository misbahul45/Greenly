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
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("No .env file found at ../../.env, using environment variables")
	}

	mongoURI := os.Getenv("MONGODB_URL")

	// ===============================
	// Local Docker implementation (fallback)
	// ===============================
	// if mongoURI == "" {
	//  mongoURI = "mongodb://root:root@localhost:27017/catalog?authSource=admin"
	// }

	// ===============================
	// Managed Cloud (MongoDB Atlas)
	// MONGODB_URL must be set. No localhost fallback.
	// ===============================
	if mongoURI == "" {
		log.Fatal("MONGODB_URL is required. Set it to your MongoDB Atlas connection string (mongodb+srv://...).")
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

	if !seeds.ResetAllowed() {
		log.Fatal("Refusing to reset catalog collections outside development. Set APP_ENV=development or SEED_ALLOW_RESET=true to allow catalog seed reset.")
	}

	log.Println("🗑️  Resetting collections...")
	seeds.ResetCollections(ctx, db)

	log.Println("🔧 Ensuring catalog indexes...")
	if err := databases.CreateCatalogIndexes(db); err != nil {
		log.Fatal("Failed to ensure catalog indexes:", err)
	}

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