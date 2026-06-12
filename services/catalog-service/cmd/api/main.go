package main

import (
	"log"
	"os"

	"catalog-service/databases"
	"catalog-service/internal/cache"
	"catalog-service/internal/coreclient"
	"catalog-service/middleware"
	"catalog-service/utils"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using process environment")
	}

	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = "8081"
	}

	mongoURI := os.Getenv("MONGODB_URL")
	if mongoURI == "" {
		log.Fatal("MONGODB_URL is required")
	}

	coreServiceURL := os.Getenv("CORE_SERVICE_URL")
	if coreServiceURL == "" {
		log.Fatal("CORE_SERVICE_URL is required")
	}

	client, err := databases.Connect(mongoURI)
	if err != nil {
		log.Fatal(err)
	}

	db := client.Database("catalog")
	coreSvc := coreclient.NewClient(coreServiceURL)

	if err := databases.CreateCategoryIndexes(db.Collection("categories")); err != nil {
		log.Fatalf("Failed to create category indexes: %v", err)
	}
	if err := databases.CreateProductIndexes(db.Collection("products")); err != nil {
		log.Fatalf("Failed to create product indexes: %v", err)
	}

	redisCache, err := cache.NewCache()
	if err != nil {
		log.Fatalf("Failed to initialize cache: %v", err)
	}

	r := gin.Default()
	r.Use(middleware.ErrorHandler())

	r.NoRoute(func(c *gin.Context) {
		utils.NotFound(c, "route not found")
	})

	r.GET("/health", func(c *gin.Context) {
		utils.OK(c, gin.H{
			"status":  "ok",
			"service": "catalog-service",
		})
	})

	api := r.Group("/")
	Routes(api, db, coreSvc, redisCache)

	go initRabbitMQ(db)

	log.Println("Server running on port " + PORT)
	r.Run(":" + PORT)
}
