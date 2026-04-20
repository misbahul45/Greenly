package main

import (
	"catalog-service/internal/coreclient"
	category "catalog-service/modules/categories"
	product "catalog-service/modules/products"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func Routes(
	r *gin.RouterGroup,
	db *mongo.Database,
	coreSvc coreclient.Client,
) {
	category.CategoryRouter(r, db)
	product.ProductRouter(r, db, coreSvc)
}