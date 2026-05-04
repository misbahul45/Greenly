package favorite

import "time"

type ToggleFavoriteRequest struct {
	ProductID string `json:"productId" binding:"required"`
}

type FavoriteResponse struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	ProductID string    `json:"productId"`
	ShopID    string    `json:"shopId"`
	CreatedAt time.Time `json:"createdAt"`
}

type FavoriteQuery struct {
	Page    int    `form:"page"`
	Limit   int    `form:"limit"`
	UserID  string `form:"user_id"`
	ProductID string `form:"product_id"`
}

type FavoriteListResponse struct {
	Favorites []FavoriteResponse `json:"favorites"`
}

type ToggleFavoriteResponse struct {
	IsFavorite bool   `json:"isFavorite"`
	ProductID  string `json:"productId"`
}