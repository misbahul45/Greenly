package main

import (
	"catalog-service/modules/product"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func Routes(r *gin.RouterGroup, db *mongo.Database) {
	product.ProductRouter(r, db)
}