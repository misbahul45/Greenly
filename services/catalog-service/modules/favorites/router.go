package favorite

import (
	"catalog-service/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func FavoriteRouter(
	rg *gin.RouterGroup,
	db *mongo.Database,
) {
	repo := NewRepository(db)
	service := NewService(repo, db.Collection("products"))
	handler := NewHandler(service)

	favorites := rg.Group("/favorites")
	{
		favorites.POST("/toggle",
			middleware.JWTAuthMiddleware(),
			handler.Toggle)

		favorites.GET("",
			middleware.JWTAuthMiddleware(),
			handler.GetUserFavorites)

		favorites.GET("/product/:productId",
			handler.GetProductFavorites)

		favorites.GET("/check/:productId",
			middleware.JWTAuthMiddleware(),
			handler.CheckFavorite)
	}
}