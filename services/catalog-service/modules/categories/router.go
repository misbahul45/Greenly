package category

import (
	"catalog-service/internal/cache"
	"catalog-service/internal/coreclient"
	"catalog-service/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func CategoryRouter(rg *gin.RouterGroup, db *mongo.Database, coreSvc coreclient.Client, redisCache cache.Cache) {
	repo := NewRepository(db)
	service := NewService(repo)
	handler := NewHandler(service)

	auth := middleware.JWTAuthMiddleware(coreSvc, redisCache)

	categories := rg.Group("/categories")
	{
		categories.GET("", handler.FindMany)
		categories.GET("/tree", handler.FindCategoryTree)
		categories.GET("/:id", handler.FindOne)

		categories.POST("", auth, middleware.RequireRole("admin"), handler.Create)
		categories.PUT("/:id", auth, middleware.RequireRole("admin"), handler.Update)
		categories.DELETE("/:id", auth, middleware.RequireRole("admin"), handler.Delete)
	}
}
