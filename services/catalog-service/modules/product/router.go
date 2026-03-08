package product

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func ProductRouter(rg *gin.RouterGroup, db *mongo.Database) {

	repo := NewProductRepository(db)
	service := NewProductService(repo)
	handler := NewProductHandler(service)

	products := rg.Group("/products")

	products.GET("", handler.FindManyProducts)
	products.GET("/:id", handler.FindOneProduct)
	products.POST("", handler.CreateProduct)
	products.PUT("/:id", handler.UpdateProduct)
	products.DELETE("/:id", handler.DeleteProduct)
}