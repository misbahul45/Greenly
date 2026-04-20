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
		products.GET("/:id", handler.FindOne)
		products.GET("/slug/:slug", handler.FindOneBySlug)

		products.POST("",
			middleware.AuthMiddleware(),
			middleware.ShopMemberRequired(coreSvc),
			middleware.RequireShopRole("admin", "product_manager"),
			handler.Create)

		products.PUT("/:id",
			middleware.AuthMiddleware(),
			middleware.ShopMemberRequired(coreSvc),
			middleware.RequireShopRole("admin", "product_manager"),
			handler.Update)

		products.PATCH("/:id/toggle-active",
			middleware.AuthMiddleware(),
			middleware.ShopMemberRequired(coreSvc),
			middleware.RequireShopRole("admin", "product_manager"),
			handler.ToggleProduct)

		products.PUT("/bulk",
			middleware.AuthMiddleware(),
			middleware.ShopMemberRequired(coreSvc),
			middleware.RequireShopRole("admin", "product_manager"),
			handler.BulkUpdate)

		products.DELETE("/:id",
			middleware.AuthMiddleware(),
			middleware.ShopMemberRequired(coreSvc),
			middleware.RequireShopRole("admin"),
			handler.Delete)
	}
}