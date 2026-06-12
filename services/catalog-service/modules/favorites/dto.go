package favorite

import "time"

type ToggleFavoriteRequest struct {
	ProductID string `json:"productId" binding:"required"`
}

type FavoriteProductSnapshot struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	Slug          string  `json:"slug"`
	ImageURL      string  `json:"imageUrl"`
	Price         float64 `json:"price"`
	Currency      string  `json:"currency"`
	Stock         int     `json:"stock"`
	CategoryName  string  `json:"categoryName,omitempty"`
	ShopName      string  `json:"shopName,omitempty"`
	RatingAverage float64 `json:"ratingAverage"`
	ReviewCount   int     `json:"reviewCount"`
	FavoriteCount int     `json:"favoriteCount"`
}

type FavoriteResponse struct {
	ID        string                   `json:"id"`
	UserID    string                   `json:"userId"`
	ProductID string                   `json:"productId"`
	ShopID    string                   `json:"shopId"`
	CreatedAt time.Time                `json:"createdAt"`
	Product   *FavoriteProductSnapshot `json:"product,omitempty"`
}

type FavoriteQuery struct {
	Page      int    `form:"page"`
	Limit     int    `form:"limit"`
	UserID    string `form:"user_id"`
	ProductID string `form:"product_id"`
}

type FavoriteListResponse struct {
	Favorites []FavoriteResponse `json:"favorites"`
}

type ToggleFavoriteResponse struct {
	IsFavorite bool   `json:"isFavorite"`
	ProductID  string `json:"productId"`
}
