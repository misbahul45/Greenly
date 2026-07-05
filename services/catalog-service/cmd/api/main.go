package main

import (
	"context"
	"log"
	"os"
	"time"

	"catalog-service/databases"
	"catalog-service/internal/cache"
	"catalog-service/internal/coreclient"
	"catalog-service/middleware"
	"catalog-service/utils"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	mongoClient *mongo.Client
	mongoDB     *mongo.Database
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
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

	mongoClient, err = databases.Connect(mongoURI)
	if err != nil {
		log.Fatal(err)
	}

	mongoDB = mongoClient.Database("catalog")
	coreSvc := coreclient.NewClient(coreServiceURL)

	if err := databases.CreateCatalogIndexes(mongoDB); err != nil {
		log.Fatalf("Failed to ensure catalog indexes: %v", err)
	}

	redisCache, err := cache.NewCache()
	if err != nil {
		// Cloud: Redis (Upstash) may be unavailable during startup.
		// Continue without cache — degraded mode.
		log.Printf("[WARN] Redis cache unavailable, operating without cache: %v", err)
		redisCache = nil
	}

	r := gin.Default()
	r.Use(middleware.RequestLoggerMiddleware())
	r.Use(middleware.ErrorHandler())

	r.NoRoute(func(c *gin.Context) {
		utils.NotFound(c, "route not found")
	})

	r.GET("/health", func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		mongoConnected := false
		if mongoClient != nil {
			err := mongoClient.Ping(ctx, nil)
			mongoConnected = err == nil
		}

		status := "ok"
		if !mongoConnected || redisCache == nil {
			status = "degraded"
		}

		utils.OK(c, gin.H{
			"status":   status,
			"service":  "catalog-service",
			"database": mongoConnected,
			"cache":    redisCache != nil,
		})
	})

	api := r.Group("/")
	Routes(api, mongoDB, coreSvc, redisCache)

	go initRabbitMQ(mongoDB)

	log.Println("Server running on port " + PORT)
	r.Run(":" + PORT)
}