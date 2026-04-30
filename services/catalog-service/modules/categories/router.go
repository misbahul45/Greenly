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
	
	categories := rg.Group("/categories")
	{
			categories.GET("", handler.FindMany)
			categories.GET("/:id", handler.FindOne)
	
			categories.POST(
				"",
				middleware.AuthMiddleware(coreSvc, redisCache),
				middleware.RequireRole("ADMIN", "SUPERADMIN"),
				handler.Create,
			)
			categories.GET("/tree", handler.FindCategoryTree)
	
categories.PUT(
				"/:id",
				middleware.AuthMiddleware(coreSvc, redisCache),
				middleware.RequireRole("ADMIN", "SUPERADMIN"),
				handler.Update,
			)

			categories.DELETE(
				"/:id",
				middleware.AuthMiddleware(coreSvc, redisCache),
				middleware.RequireRole("ADMIN", "SUPERADMIN"),
				handler.Delete,
			)
	}
}