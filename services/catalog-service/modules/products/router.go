package product

import (
	"catalog-service/internal/cache"
	"catalog-service/internal/coreclient"
	"catalog-service/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func ProductRouter(rg *gin.RouterGroup, db *mongo.Database, coreSvc coreclient.Client, redisCache cache.Cache, publishers ...ProductEventPublisher) {
	repo := NewRepository(db)
	service := NewService(repo, publishers...)
	handler := NewHandler(service)

	auth := middleware.JWTAuthMiddleware(coreSvc, redisCache)

	products := rg.Group("/products")
	{
		products.GET("", handler.FindMany)
		products.GET("/search", handler.Search)
		products.GET("/slug/:slug", handler.FindOneBySlug)
		products.GET("/:id", handler.FindOne)

		products.POST("", auth, middleware.SellerOnly(), handler.Create)
		products.PUT("/:id", auth, middleware.SellerOnly(), handler.Update)
		products.PATCH("/:id/toggle", auth, middleware.SellerOnly(), handler.ToggleProduct)
		products.PATCH("/bulk", auth, middleware.SellerOnly(), handler.BulkUpdate)
		products.DELETE("/:id", auth, middleware.SellerOnly(), handler.Delete)
	}
}
