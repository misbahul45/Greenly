package inventory

import (
	"catalog-service/internal/cache"
	"catalog-service/internal/coreclient"
	"catalog-service/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func InventoryRouter(rg *gin.RouterGroup, db *mongo.Database, coreSvc coreclient.Client, redisCache cache.Cache) {
	repo := NewRepository(db)
	service := NewService(repo)
	handler := NewHandler(service)

	auth := middleware.JWTAuthMiddleware(coreSvc, redisCache)

	inv := rg.Group("/inventory")
	{
		inv.GET("/:productId", handler.GetByProductID)

		inv.POST("", auth, middleware.SellerOnly(), handler.Create)
		inv.PUT("/:productId", auth, middleware.SellerOnly(), handler.Update)
		inv.POST("/:productId/reserve", auth, handler.ReserveStock)
		inv.POST("/:productId/release", auth, handler.ReleaseStock)
	}
}
