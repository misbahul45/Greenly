package main

import (
	"catalog-service/databases"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = "3000"
	}

	mongoURI := os.Getenv("MONGODB_URL")

	client, err := databases.Connect(mongoURI)
	if err != nil {
		log.Fatal(err)
	}

	db := client.Database("catalog")

	r := gin.Default()

	api := r.Group("/")

	Routes(api, db)

	r.Run(":" + PORT)
}