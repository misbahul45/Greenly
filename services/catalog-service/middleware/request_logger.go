package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func RequestLoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		requestID := c.GetHeader("x-request-id")
		if requestID == "" {
			requestID = c.GetHeader("x-correlation-id")
		}
		if requestID == "" {
			requestID = uuid.New().String()
		}

		c.Writer.Header().Set("x-request-id", requestID)
		c.Set("request_id", requestID)

		log.Printf("[HTTP IN] service=catalog-service requestId=%s method=%s path=%s query=%s ip=%s userAgent=%q",
			requestID,
			c.Request.Method,
			c.Request.URL.Path,
			c.Request.URL.RawQuery,
			c.ClientIP(),
			c.Request.UserAgent(),
		)

		c.Next()

		duration := time.Since(start)
		status := c.Writer.Status()

		if len(c.Errors) > 0 {
			log.Printf("[HTTP ERROR] service=catalog-service requestId=%s method=%s path=%s status=%d durationMs=%d errors=%v",
				requestID,
				c.Request.Method,
				c.Request.URL.Path,
				status,
				duration.Milliseconds(),
				c.Errors.String(),
			)
			return
		}

		log.Printf("[HTTP OUT] service=catalog-service requestId=%s method=%s path=%s status=%d durationMs=%d",
			requestID,
			c.Request.Method,
			c.Request.URL.Path,
			status,
			duration.Milliseconds(),
		)
	}
}
