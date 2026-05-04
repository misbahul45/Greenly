package ecoattribute

import (
	"catalog-service/internal/cache"
	"catalog-service/internal/coreclient"
	"catalog-service/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func EcoAttributeRouter(rg *gin.RouterGroup, db *mongo.Database, coreSvc coreclient.Client, redisCache cache.Cache) {
	repo := NewRepository(db)
	service := NewService(repo)
	handler := NewHandler(service)

	auth := middleware.JWTAuthMiddleware(coreSvc, redisCache)

	eco := rg.Group("/eco-attributes")
	{
		eco.GET("/:productId", handler.GetByProductID)

		eco.POST("", auth, middleware.SellerOnly(), handler.Create)
		eco.PUT("/:productId", auth, middleware.SellerOnly(), handler.Update)
		eco.DELETE("/:productId", auth, middleware.SellerOnly(), handler.Delete)
	}
}
