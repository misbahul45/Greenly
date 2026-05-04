package middleware

import (
	"slices"

	"github.com/gin-gonic/gin"
)

func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRaw, exists := c.Get("user")
		if !exists {
			c.Error(NewAppError(401, "Unauthorized", nil))
			c.Abort()
			return
		}

		user := userRaw.(*UserLogin)
		for _, r := range user.Roles {
			if slices.Contains(roles, r) {
				c.Next()
				return
			}
		}

		c.Error(NewAppError(403, "Forbidden", nil))
		c.Abort()
	}
}

func AdminOnly() gin.HandlerFunc {
	return RequireRole("admin")
}

func SellerOnly() gin.HandlerFunc {
	return RequireRole("seller", "admin")
}
