package main

import (
	"catalog-service/modules/category"
	"catalog-service/modules/product"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func Routes(r *gin.RouterGroup, db *mongo.Database) {
	category.CategoryRouter(r, db)
	product.ProductRouter(r, db)
}