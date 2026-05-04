package review

import (
	"catalog-service/middleware"
	productrating "catalog-service/modules/product_rating"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func ReviewRouter(rg *gin.RouterGroup, db *mongo.Database) {
	ratingRepo := productrating.NewRepository(db)
	repo := NewRepository(db)
	service := NewService(repo, ratingRepo, db.Collection("products"))
	handler := NewHandler(service)

	reviews := rg.Group("/reviews")
	{
		reviews.GET("/product/:productId", handler.GetByProduct)
		reviews.GET("/mine", middleware.JWTAuthMiddleware(), handler.GetByUser)
		reviews.GET("/:id", handler.GetByID)

		reviews.POST("", middleware.JWTAuthMiddleware(), handler.Create)

		reviews.PUT("/:id", middleware.JWTAuthMiddleware(), handler.Update)

		reviews.DELETE("/:id", middleware.JWTAuthMiddleware(), handler.Delete)

		reviews.POST("/:id/helpful", handler.MarkHelpful)
	}
}
