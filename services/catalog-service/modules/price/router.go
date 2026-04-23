package price

import (
	"catalog-service/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func PriceRouter(rg *gin.RouterGroup, db *mongo.Database) {
	repo := NewRepository(db)
	service := NewService(repo)
	handler := NewHandler(service)

	prices := rg.Group("/prices")
	{
		prices.GET("/:productId", handler.FindByProductID)

		prices.POST("",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.Create)

		prices.PUT("/:productId",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.Update)
	}
}