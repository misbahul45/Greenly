package review

import (
	"catalog-service/internal/cache"
	"catalog-service/internal/coreclient"
	"catalog-service/middleware"
	productrating "catalog-service/modules/product_rating"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func ReviewRouter(rg *gin.RouterGroup, db *mongo.Database, coreSvc coreclient.Client, redisCache cache.Cache) {
	ratingRepo := productrating.NewRepository(db)
	repo := NewRepository(db)
	service := NewService(repo, ratingRepo, db.Collection("products"))
	handler := NewHandler(service)

	auth := middleware.JWTAuthMiddleware(coreSvc, redisCache)

	reviews := rg.Group("/reviews")
	{
		reviews.GET("/product/:productId", handler.GetByProduct)
		reviews.GET("/mine", auth, handler.GetByUser)
		reviews.GET("/:id", handler.GetByID)

		reviews.POST("", auth, handler.Create)
		reviews.PUT("/:id", auth, handler.Update)
		reviews.DELETE("/:id", auth, handler.Delete)
		reviews.POST("/:id/helpful", handler.MarkHelpful)
	}
}
