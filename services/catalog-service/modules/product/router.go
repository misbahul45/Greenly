package product

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func ProductRouter(rg *gin.RouterGroup, db *mongo.Database) {

	repo := NewRepository(db)
	service := NewService(repo)
	handler := NewHandler(service)

	products := rg.Group("/products")
	{
		products.GET("", handler.FindMany)
		products.GET("/:id", handler.FindOne)
		products.GET("/slug/:slug", handler.FindOneBySlug)

		products.POST("", handler.Create)
		products.PATCH("/:id", handler.Update)

		products.DELETE("/:id", handler.Delete)
	}
}