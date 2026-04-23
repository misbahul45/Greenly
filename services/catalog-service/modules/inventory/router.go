package inventory

import (
	"catalog-service/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func InventoryRouter(rg *gin.RouterGroup, db *mongo.Database) {
	repo := NewRepository(db)
	service := NewService(repo)
	handler := NewHandler(service)

	inventory := rg.Group("/inventory")
	{
		inventory.GET("/:productId", handler.GetByProductID)

		inventory.POST("",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.Create)

		inventory.PUT("/:productId",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.Update)

		inventory.POST("/:productId/reserve",
			middleware.JWTAuthMiddleware(),
			handler.ReserveStock)

		inventory.POST("/:productId/release",
			middleware.JWTAuthMiddleware(),
			handler.ReleaseStock)
	}
}