package middleware

import (
	"slices"

	"github.com/gin-gonic/gin"
)

func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {

		userRaw, exists := c.Get("user")
		if !exists {
			c.AbortWithStatusJSON(401, gin.H{
				"message": "Unauthorized",
			})
			return
		}

		user := userRaw.(*UserLogin)

		for _, r := range user.Roles {
			if slices.Contains(roles, r) {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(403, gin.H{
			"message": "Forbidden",
		})
	}
}