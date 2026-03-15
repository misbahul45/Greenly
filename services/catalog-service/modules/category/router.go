package category

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func CategoryRouter(rg *gin.RouterGroup, db *mongo.Database) {
   repo := NewRepository(db)
   service := NewService(repo)
   handler := NewHandler(service)
   
   categories := rg.Group("/categories")
   {
      categories.GET("", handler.FindMany)
      categories.GET("/:id", handler.FindOne)
      categories.POST("", handler.Create)
      categories.PUT("/:id", handler.Update)
      categories.DELETE("/:id", handler.Delete)
   }
}