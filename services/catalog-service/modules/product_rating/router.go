package productrating

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func ProductRatingRouter(
	rg *gin.RouterGroup,
	db *mongo.Database,
) {
	repo := NewRepository(db)
	service := NewService(repo)
	handler := NewHandler(service)

	ratings := rg.Group("/ratings")
	{
		ratings.GET("/product/:productId", handler.GetByProductID)
		ratings.POST("/batch", handler.GetProductsRatings)
		ratings.GET("/top", handler.GetTopRatedProducts)
	}
}