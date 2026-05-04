package review

import (
	"catalog-service/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func ReviewRouter(
	rg *gin.RouterGroup,
	db *mongo.Database,
) {
	repo := NewRepository(db)
	service := NewService(repo, nil, db.Collection("products"))
	handler := NewHandler(service)

	reviews := rg.Group("/reviews")
	{
		reviews.GET("/product/:productId", handler.GetByProduct)
		reviews.GET("/mine", middleware.JWTAuthMiddleware(), handler.GetByUser)
		reviews.GET("/shop", middleware.JWTAuthMiddleware(), handler.GetByShop)
		reviews.GET("/:id", handler.GetByID)

		reviews.POST("", middleware.JWTAuthMiddleware(), handler.Create)

		reviews.PUT("/:id",
			middleware.JWTAuthMiddleware(),
			handler.Update)

		reviews.DELETE("/:id",
			middleware.JWTAuthMiddleware(),
			handler.Delete)

		reviews.POST("/:id/helpful",
			handler.MarkHelpful)
	}
}