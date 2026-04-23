package middleware

import (
	"catalog-service/internal/coreclient"
	"strings"

	"github.com/gin-gonic/gin"
)

func ShopMemberRequiredWithCore(coreClient coreclient.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRaw, exists := c.Get("user")
		if !exists {
			c.Error(NewAppError(401, "Unauthorized", nil))
			c.Abort()
			return
		}

		user := userRaw.(*UserLogin)
		userID := user.Sub

		shopID := extractShopID(c)
		if shopID == "" {
			c.Error(NewAppError(400, "Shop ID is required", nil))
			c.Abort()
			return
		}

		membership, err := coreClient.ValidateShopMembership(c.Request.Context(), shopID, userID)
		if err != nil {
			if strings.Contains(err.Error(), "not a member") {
				c.Error(NewAppError(403, "Forbidden: Not a member of this shop", nil))
				c.Abort()
				return
			}
			c.Error(NewAppError(500, "Failed to validate shop membership", err))
			c.Abort()
			return
		}

		c.Set("shopID", shopID)
		c.Set("shopRoles", membership.Roles)
		c.Next()
	}
}