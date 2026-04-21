package product

import (
	"catalog-service/internal/coreclient"
	"catalog-service/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func ProductRouter(
	rg *gin.RouterGroup,
	db *mongo.Database,
	coreSvc coreclient.Client,
) {
	repo := NewRepository(db)
	service := NewService(repo)
	handler := NewHandler(service)

	products := rg.Group("/products")
	{
		products.GET("", handler.FindMany)
		products.GET("/search", handler.Search)
		products.GET("/:id", handler.FindOne)
		products.GET("/slug/:slug", handler.FindOneBySlug)

		products.POST("",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.Create)

		products.PUT("/:id",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.Update)

		products.PATCH("/:id/toggle",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.ToggleProduct)

		products.PATCH("/bulk",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.BulkUpdate)

		products.DELETE("/:id",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.Delete)
	}
}