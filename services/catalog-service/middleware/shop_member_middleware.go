package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func ShopMemberRequired() gin.HandlerFunc {
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

		for _, membership := range user.ShopMemberships {
			if membership.ShopID == shopID {
				c.Set("shopID", shopID)
				c.Set("shopRoles", membership.Roles)
				c.Next()
				return
			}
		}

		c.Error(NewAppError(403, "Forbidden: Not a member of this shop", nil))
		c.Abort()
	}
}

func extractShopID(c *gin.Context) string {
	shopID := c.Param("shop_id")
	if shopID != "" {
		return shopID
	}

	shopID = c.Param("id")
	if shopID != "" && c.Request.Method != "GET" {
		return shopID
	}

	shopID = c.Query("shop_id")
	if shopID != "" {
		return shopID
	}

	type BodyStruct struct {
		ShopID string `json:"shopId"`
	}
	var body BodyStruct
	if c.ShouldBindBodyWith(&body, binding.JSON) == nil && body.ShopID != "" {
		c.Request.Body = c.Request.Body
		return body.ShopID
	}

	return ""
}