package productdiscount

import (
	"catalog-service/internal/cache"
	"catalog-service/internal/coreclient"
	"catalog-service/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func ProductDiscountRouter(rg *gin.RouterGroup, db *mongo.Database, coreSvc coreclient.Client, redisCache cache.Cache) {
	repo := NewRepository(db)
	service := NewService(repo)
	handler := NewHandler(service)

	auth := middleware.JWTAuthMiddleware(coreSvc, redisCache)

	discounts := rg.Group("/discounts")
	{
		discounts.GET("/:productId", handler.FindByProductID)

		discounts.POST("", auth, middleware.SellerOnly(), handler.Create)
		discounts.PUT("/:id", auth, middleware.SellerOnly(), handler.Update)
		discounts.DELETE("/:id", auth, middleware.SellerOnly(), handler.Delete)
	}
}
