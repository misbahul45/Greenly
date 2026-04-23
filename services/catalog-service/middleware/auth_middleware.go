package middleware

import (
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type UserLogin struct {
	Sub   string   `json:"sub"`
	Email string   `json:"email"`
	Roles []string `json:"roles"`
	jwt.RegisteredClaims
}

func AuthMiddleware() gin.HandlerFunc {
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

		if err != nil {
			c.Error(NewAppError(401, "Invalid token", err))
			c.Abort()
			return
		}

		claims, ok := token.Claims.(*UserLogin)

		if !ok || !token.Valid {
			c.Error(NewAppError(401, "Unauthorized", nil))
			c.Abort()
			return
		}

		// inject user ke context
		c.Set("user", claims)

		c.Next()
	}
}