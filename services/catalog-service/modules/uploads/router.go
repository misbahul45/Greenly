package uploads

import (
	"catalog-service/internal/cache"
	"catalog-service/internal/coreclient"
	"catalog-service/internal/imagekit"
	"catalog-service/middleware"

	"github.com/gin-gonic/gin"
)

func UploadRouter(rg *gin.RouterGroup, coreSvc coreclient.Client, redisCache cache.Cache) {
	imagekitClient := imagekit.NewClient()
	handler := NewHandler(imagekitClient)

	auth := middleware.JWTAuthMiddleware(coreSvc, redisCache)

	uploads := rg.Group("/uploads")
	{
		// Any authenticated user can upload an avatar — no SellerOnly() guard
		uploads.POST("/avatar", auth, handler.UploadAvatar)
	}
}
