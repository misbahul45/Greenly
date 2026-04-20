package middleware

import "github.com/golang-jwt/jwt/v5"

type ShopMembership struct {
	ShopID string   `json:"shopId"`
	Roles  []string `json:"roles"`
}

type UserLogin struct {
	Sub            string           `json:"sub"`
	Email          string           `json:"email"`
	Roles          []string         `json:"roles"`
	ShopMemberships []ShopMembership `json:"shopMemberships"`
	jwt.RegisteredClaims
}