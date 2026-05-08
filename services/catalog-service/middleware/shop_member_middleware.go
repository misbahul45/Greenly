package middleware

import (
	"catalog-service/internal/coreclient"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func ShopMemberRequired(coreSvc coreclient.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRaw, exists := c.Get("user")
		if !exists {
			c.Error(NewAppError(401, "Unauthorized", nil))
			c.Abort()
			return
		}

		user := userRaw.(*UserLogin)

		shopID := extractShopID(c)
		if shopID == "" {
			c.Error(NewAppError(400, "Shop ID is required", nil))
			c.Abort()
			return
		}

		membership, err := coreSvc.ValidateShopMembership(c.Request.Context(), shopID, user.Subject) // ✅ Sub → Subject
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

func extractShopID(c *gin.Context) string {
	if id := c.Param("shop_id"); id != "" {
		return id
	}

	if id := c.Query("shop_id"); id != "" {
		return id
	}

	var body struct {
		ShopID string `json:"shopId"`
	}
	if c.ShouldBindBodyWith(&body, binding.JSON) == nil && body.ShopID != "" {
		return body.ShopID
	}

	return ""
}