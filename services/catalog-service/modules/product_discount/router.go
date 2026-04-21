package productdiscount

import (
	"catalog-service/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func ProductDiscountRouter(rg *gin.RouterGroup, db *mongo.Database) {
	repo := NewRepository(db)
	service := NewService(repo)
	handler := NewHandler(service)

	discounts := rg.Group("/discounts")
	{
		discounts.GET("/:productId", handler.FindByProductID)

		discounts.POST("",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.Create)

		discounts.PUT("/:id",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.Update)

		discounts.DELETE("/:id",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.Delete)
	}
}