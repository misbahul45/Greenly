package middleware

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"catalog-service/internal/cache"
	"catalog-service/internal/coreclient"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const userCacheTTL = 5 * time.Minute

func tokenCacheKey(token string) string {
	h := sha256.Sum256([]byte(token))
	return fmt.Sprintf("%x", h)
}

func AuthMiddleware(coreSvc coreclient.Client, redisCache cache.Cache) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Error(NewAppError(401, "Unauthorized", nil))
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.Error(NewAppError(401, "Invalid Authorization header", nil))
			c.Abort()
			return
		}

		tokenString := parts[1]

		secret := os.Getenv("JWT_ACCESS_SECRET_KEY")
		if secret == "" {
			c.Error(NewAppError(500, "JWT secret not configured", nil))
			c.Abort()
			return
		}

		token, err := jwt.ParseWithClaims(
			tokenString,
			&UserLogin{},
			func(t *jwt.Token) (interface{}, error) {
				return []byte(secret), nil
			},
		)
		if err != nil || !token.Valid {
			c.Error(NewAppError(401, "Invalid token", nil))
			c.Abort()
			return
		}

		claims, ok := token.Claims.(*UserLogin)
		if !ok {
			c.Error(NewAppError(401, "Unauthorized", nil))
			c.Abort()
			return
		}

		cacheKey := tokenCacheKey(tokenString)
		cached, err := redisCache.GetUser(c.Request.Context(), cacheKey)
		if err == nil && cached != "" {
			var user coreclient.User
			if json.Unmarshal([]byte(cached), &user) == nil {
				c.Set("user", claims)
				c.Set("verified_user", &user)
				c.Next()
				return
			}
		}

		user, err := coreSvc.GetMe(c.Request.Context(), tokenString)
		if err != nil {
			c.Error(NewAppError(401, "User not found or session expired", nil))
			c.Abort()
			return
		}

		redisCache.SetUser(c.Request.Context(), cacheKey, user, userCacheTTL)

		c.Set("user", claims)
		c.Set("verified_user", user)
		c.Next()
	}
}
