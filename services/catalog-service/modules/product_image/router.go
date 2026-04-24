package productimage

import (
	"catalog-service/internal/imagekit"
	"catalog-service/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func ProductImageRouter(rg *gin.RouterGroup, db *mongo.Database) {
	repo := NewRepository(db)
	imagekitClient := imagekit.NewClient()
	service := NewService(repo, imagekitClient)
	handler := NewHandler(service)

	images := rg.Group("/product-images")
	{
		images.GET("/:productId", handler.GetByProductID)

		images.POST("",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.Upload)

		images.PATCH("/:productId/primary",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.SetPrimary)

		images.PATCH("/:productId/reorder",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.Reorder)

		images.DELETE("/:id",
			middleware.JWTAuthMiddleware(),
			middleware.SellerOnly(),
			handler.Delete)
	}
}
