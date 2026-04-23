package middleware

import (
	"net/http"
	"time"
	"github.com/gin-gonic/gin"
)

type AppError struct {
	StatusCode int
	Message    string
	Errors     interface{}
}

func (e *AppError) Error() string {
	return e.Message
}

func NewAppError(status int, msg string, errors interface{}) *AppError {
	return &AppError{
		StatusCode: status,
		Message:    msg,
		Errors:     errors,
	}
}


func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {

		c.Next()

		if len(c.Errors) == 0 {
			return
		}

		err := c.Errors.Last().Err

		status := http.StatusInternalServerError
		message := "Internal Server Error"
		var errors interface{} = nil

		if appErr, ok := err.(*AppError); ok {
			status = appErr.StatusCode
			message = appErr.Message
			errors = appErr.Errors
		}

		c.AbortWithStatusJSON(status, gin.H{
			"status":     false,
			"statusCode": status,
			"path":       c.Request.URL.Path,
			"message":    message,
			"errors":     errors,
			"timestamp":  time.Now().UTC().Format(time.RFC3339),
		})
	}
}