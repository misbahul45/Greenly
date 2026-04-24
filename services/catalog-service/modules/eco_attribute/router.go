package ecoattribute

import (
	"catalog-service/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func EcoAttributeRouter(rg *gin.RouterGroup, db *mongo.Database) {
	repo := NewRepository(db)
	service := NewService(repo)
	handler := NewHandler(service)

	eco := rg.Group("/eco-attributes")
	{
		eco.GET("/:productId", handler.GetByProductID)

		eco.POST("",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.Create)

		eco.PUT("/:productId",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.Update)

		eco.DELETE("/:productId",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.Delete)
	}
}
