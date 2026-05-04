package price

import (
	"catalog-service/internal/cache"
	"catalog-service/internal/coreclient"
	"catalog-service/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func PriceRouter(rg *gin.RouterGroup, db *mongo.Database, coreSvc coreclient.Client, redisCache cache.Cache) {
	repo := NewRepository(db)
	service := NewService(repo)
	handler := NewHandler(service)

	auth := middleware.JWTAuthMiddleware(coreSvc, redisCache)

	prices := rg.Group("/prices")
	{
		prices.GET("/:productId", handler.FindByProductID)

		prices.POST("", auth, middleware.SellerOnly(), handler.Create)
		prices.PUT("/:productId", auth, middleware.SellerOnly(), handler.Update)
	}
}
