package favorite

import (
	"catalog-service/internal/cache"
	"catalog-service/internal/coreclient"
	"catalog-service/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func FavoriteRouter(rg *gin.RouterGroup, db *mongo.Database, coreSvc coreclient.Client, redisCache cache.Cache) {
	repo := NewRepository(db)
	service := NewService(repo, db.Collection("products"))
	handler := NewHandler(service)

	auth := middleware.JWTAuthMiddleware(coreSvc, redisCache)

	favorites := rg.Group("/favorites")
	{
		favorites.POST("/toggle", auth, handler.Toggle)
		favorites.GET("", auth, handler.GetUserFavorites)
		favorites.GET("/product/:productId", handler.GetProductFavorites)
		favorites.GET("/check/:productId", auth, handler.CheckFavorite)
	}
}
