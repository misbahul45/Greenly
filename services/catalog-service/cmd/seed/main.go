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

	log.Println("🌱 Starting catalog seed...")

	categoryIDs := seeds.SeedCategories(ctx, db)
	seeds.SeedProducts(ctx, db, categoryIDs)
	seeds.SeedPrices(ctx, db)
	seeds.SeedInventories(ctx, db)
	seeds.SeedProductImages(ctx, db)
	seeds.SeedProductDiscounts(ctx, db)
	seeds.SeedEcoAttributes(ctx, db)
	seeds.SeedActivePrices(ctx, db)

	log.Println("🎉 Catalog seed completed successfully!")
}
