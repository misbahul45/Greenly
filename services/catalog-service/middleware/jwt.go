package middleware

import (
	"errors"

	"github.com/gin-gonic/gin"
)

func GetUserID(c *gin.Context) (string, error) {
	id, exists := c.Get("user_id")
	if !exists {
		return "", errors.New("user not found in context")
	}
	return id.(string), nil
}

func GetUserEmail(c *gin.Context) (string, error) {
	email, exists := c.Get("user_email")
	if !exists {
		return "", errors.New("user email not found in context")
	}
	return email.(string), nil
}

func GetUserRoles(c *gin.Context) ([]string, error) {
	rolesRaw, exists := c.Get("user_roles")
	if !exists {
		return nil, errors.New("user roles not found in context")
	}
	roles, ok := rolesRaw.([]string)
	if !ok {
		return nil, errors.New("invalid user roles type")
	}
	return roles, nil
}

func HasRole(c *gin.Context, role string) bool {
	roles, err := GetUserRoles(c)
	if err != nil {
		return false
	}
	for _, r := range roles {
		if r == role {
			return true
		}
	}
	return false
}

func IsAdmin(c *gin.Context) bool {
	return HasRole(c, "admin")
}

func IsSeller(c *gin.Context) bool {
	return HasRole(c, "seller") || HasRole(c, "admin")
}

func GetShopMemberships(c *gin.Context) ([]ShopMembership, error) {
	raw, exists := c.Get("shop_memberships")
	if !exists {
		return nil, errors.New("shop memberships not found in context")
	}
	memberships, ok := raw.([]ShopMembership)
	if !ok {
		return nil, errors.New("invalid shop memberships type")
	}
	return memberships, nil
}

func GetUserShopID(c *gin.Context) (string, error) {
	memberships, err := GetShopMemberships(c)
	if err != nil {
		return "", err
	}
	if len(memberships) == 0 {
		return "", errors.New("user has no shop memberships")
	}
	return memberships[0].ShopID, nil
}

func IsShopMember(c *gin.Context, shopID string) bool {
	memberships, err := GetShopMemberships(c)
	if err != nil {
		return false
	}
	for _, m := range memberships {
		if m.ShopID == shopID {
			return true
		}
	}
	return false
}

func GetShopRoles(c *gin.Context, shopID string) ([]string, error) {
	memberships, err := GetShopMemberships(c)
	if err != nil {
		return nil, err
	}
	for _, m := range memberships {
		if m.ShopID == shopID {
			return m.Roles, nil
		}
	}
	return nil, errors.New("user is not a member of this shop")
}

func HasShopRole(c *gin.Context, shopID string, role string) bool {
	roles, err := GetShopRoles(c, shopID)
	if err != nil {
		return false
	}
	for _, r := range roles {
		if r == role {
			return true
		}
	}
	return false
}
