package middleware

import (
	"errors"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type UserClaims struct {
	Sub               string           `json:"sub"`
	Email             string           `json:"email"`
	Roles             []string         `json:"roles"`
	ShopMemberships   []ShopMembership `json:"shopMemberships"`
	jwt.RegisteredClaims
}

func GetUserID(c *gin.Context) (string, error) {
	userRaw, exists := c.Get("user")
	if !exists {
		return "", errors.New("user not found in context")
	}

	claims, ok := userRaw.(*UserLogin)
	if !ok {
		return "", errors.New("invalid user claims")
	}

	return claims.Sub, nil
}

func GetUserEmail(c *gin.Context) (string, error) {
	userRaw, exists := c.Get("user")
	if !exists {
		return "", errors.New("user not found in context")
	}

	claims, ok := userRaw.(*UserLogin)
	if !ok {
		return "", errors.New("invalid user claims")
	}

	return claims.Email, nil
}

func GetUserRoles(c *gin.Context) ([]string, error) {
	userRaw, exists := c.Get("user")
	if !exists {
		return nil, errors.New("user not found in context")
	}

	claims, ok := userRaw.(*UserLogin)
	if !ok {
		return nil, errors.New("invalid user claims")
	}

	return claims.Roles, nil
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
	roles, err := GetUserRoles(c)
	if err != nil {
		return false
	}

	for _, r := range roles {
		if r == "seller" || r == "admin" {
			return true
		}
	}
	return false
}

func GetShopMemberships(c *gin.Context) ([]ShopMembership, error) {
	userRaw, exists := c.Get("user")
	if !exists {
		return nil, errors.New("user not found in context")
	}

	claims, ok := userRaw.(*UserLogin)
	if !ok {
		return nil, errors.New("invalid user claims")
	}

	return claims.ShopMemberships, nil
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

func JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.AbortWithStatusJSON(401, gin.H{
				"message": "Authorization header required",
			})
			return
		}

		parts := strings.Split(authHeader, " ")

		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(401, gin.H{
				"message": "Invalid Authorization header format",
			})
			return
		}

		tokenString := parts[1]

		secret := os.Getenv("JWT_ACCESS_SECRET_KEY")

		if secret == "" {
			c.AbortWithStatusJSON(500, gin.H{
				"message": "JWT secret not configured",
			})
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
			c.AbortWithStatusJSON(401, gin.H{
				"message": "Invalid token",
			})
			return
		}

		claims, ok := token.Claims.(*UserLogin)

		if !ok || !token.Valid {
			c.AbortWithStatusJSON(401, gin.H{
				"message": "Unauthorized",
			})
			return
		}

		c.Set("user", claims)
		c.Set("user_id", claims.Sub)
		c.Set("user_email", claims.Email)
		c.Set("user_roles", claims.Roles)
		c.Set("shopMemberships", claims.ShopMemberships)

		c.Next()
	}
}

func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !IsAdmin(c) {
			c.AbortWithStatusJSON(403, gin.H{
				"message": "Admin access required",
			})
			return
		}
		c.Next()
	}
}

func SellerOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !IsSeller(c) {
			c.AbortWithStatusJSON(403, gin.H{
				"message": "Seller access required",
			})
			return
		}
		c.Next()
	}
}
