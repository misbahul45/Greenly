package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"catalog-service/utils"
)


type AppError struct {
	StatusCode int
	Message    string
}

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {

		c.Next()

		if len(c.Errors) > 0 {
			err := c.Errors.Last()

			utils.Error(
				c,
				http.StatusInternalServerError,
				err.Error(),
				nil,
			)
		}
	}
}