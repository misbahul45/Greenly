package productimage

import (
	"catalog-service/internal/cache"
	"catalog-service/internal/coreclient"
	"catalog-service/internal/imagekit"
	"catalog-service/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func ProductImageRouter(rg *gin.RouterGroup, db *mongo.Database, coreSvc coreclient.Client, redisCache cache.Cache) {
	repo := NewRepository(db)
	imagekitClient := imagekit.NewClient()
	service := NewService(repo, imagekitClient)
	handler := NewHandler(service)

	auth := middleware.JWTAuthMiddleware(coreSvc, redisCache)

	images := rg.Group("/product-images")
	{
		images.GET("/:productId", handler.GetByProductID)

		images.POST("", auth, middleware.SellerOnly(), handler.Upload)
		images.PATCH("/:productId/primary", auth, middleware.SellerOnly(), handler.SetPrimary)
		images.PATCH("/:productId/reorder", auth, middleware.SellerOnly(), handler.Reorder)
		images.DELETE("/:id", auth, middleware.SellerOnly(), handler.Delete)
	}
}
