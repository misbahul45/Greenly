package middleware

import (
	"log"
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
	if e.Errors != nil {
		return e.Message + ": " + toLogString(e.Errors)
	}
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
		var rootCause interface{} = err
		var clientErrors interface{} = nil

		if appErr, ok := err.(*AppError); ok {
			status = appErr.StatusCode
			message = appErr.Message
			rootCause = appErr.Errors
			if status < http.StatusInternalServerError {
				clientErrors = appErr.Errors
			}
		}

		requestID, _ := c.Get("request_id")
		log.Printf("[ERROR] service=catalog-service requestId=%v method=%s path=%s status=%d message=%q cause=%v",
			requestID,
			c.Request.Method,
			c.Request.URL.Path,
			status,
			message,
			rootCause,
		)

		c.AbortWithStatusJSON(status, gin.H{
			"status":     false,
			"statusCode": status,
			"path":       c.Request.URL.Path,
			"message":    message,
			"errors":     clientErrors,
			"requestId":  requestID,
			"timestamp":  time.Now().UTC().Format(time.RFC3339),
		})
	}
}

func toLogString(value interface{}) string {
	if err, ok := value.(error); ok {
		return err.Error()
	}
	return "root cause attached"
}
