package product

import (
	"catalog-service/middleware"

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

		products.POST("", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN", "SUPERADMIN"), handler.Create)
		products.PATCH("/:id", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN", "SUPERADMIN"), handler.Update)
		products.DELETE("/:id", middleware.AuthMiddleware(), middleware.RequireRole("ADMIN", "SUPERADMIN"), handler.Delete)
	}
}