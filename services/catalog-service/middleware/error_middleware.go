package middleware

import (
	"net/http"

	"catalog-service/utils"

	"github.com/gin-gonic/gin"
)

type AppError struct {
	StatusCode int
	Message    string
}

func (e *AppError) Error() string {
	return e.Message
}

func NewAppError(status int, msg string) *AppError {
	return &AppError{
		StatusCode: status,
		Message:    msg,
	}
}

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {

		c.Next()

		if len(c.Errors) > 0 {

			err := c.Errors.Last().Err

			// cek apakah AppError
			if appErr, ok := err.(*AppError); ok {

				utils.Error(
					c,
					appErr.StatusCode,
					appErr.Message,
					nil,
				)

				return
			}

			// fallback error
			utils.Error(
				c,
				http.StatusInternalServerError,
				"internal server error",
				nil,
			)
		}
	}
}