package middleware

import (
	"slices"

	"github.com/gin-gonic/gin"
)

func RequireShopRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		rolesRaw, exists := c.Get("shopRoles")
		if !exists {
			c.Error(NewAppError(403, "Forbidden", nil))
			c.Abort()
			return
		}

		shopRoles := rolesRaw.([]string)

		for _, r := range shopRoles {
			if slices.Contains(roles, r) {
				c.Next()
				return
			}
		}

		c.Error(NewAppError(403, "Forbidden: Insufficient shop role", nil))
		c.Abort()
	}
}