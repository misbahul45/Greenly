package product

import "time"

type ProductQuery struct {
	Page       int     `form:"page"`
	Limit      int     `form:"limit"`
	Search     string  `form:"search"`
	ShopID     string  `form:"shop_id"`
	CategoryID string  `form:"category_id"`
	MinPrice   float64 `form:"min_price"`
	MaxPrice   float64 `form:"max_price"`
	MinRating  float64 `form:"min_rating"`
	IsActive   *bool   `form:"is_active"`
	SortBy     string  `form:"sort_by"`
	SortOrder  string  `form:"sort_order"`
}

type ProductSearchQuery struct {
	Page       int      `form:"page"`
	Limit      int      `form:"limit"`
	Keyword    string   `form:"q"`
	ShopIDs    []string `form:"shop_ids"`
	CategoryID string   `form:"category_id"`
	MinPrice   float64  `form:"min_price"`
	MaxPrice   float64  `form:"max_price"`
	MinRating  float64  `form:"min_rating"`
	SortBy     string   `form:"sort_by"`
	SortOrder  string   `form:"sort_order"`
}

type CreateProductDTO struct {
	ShopID      string   `json:"shopId" binding:"required"`
	CategoryID  string   `json:"categoryId" binding:"required"`
	Name        string   `json:"name" binding:"required"`
	Slug        string   `json:"slug"`
	Description string   `json:"description"`
	SKU         string   `json:"sku" binding:"required"`
	Price       float64  `json:"price" binding:"required"`
	Currency    string   `json:"currency" binding:"required"`
	Stock       int      `json:"stock" binding:"required"`
	ImageURLs   []string `json:"imageUrls"`
	IsActive    bool     `json:"isActive"`
}

type UpdateProductDTO struct {
	Name        *string  `json:"name"`
	Slug        *string  `json:"slug"`
	Description *string  `json:"description"`
	SKU         *string  `json:"sku"`
	Price       *float64 `json:"price"`
	Currency    *string  `json:"currency"`
	Stock       *int     `json:"stock"`
	ImageURLs   []string `json:"imageUrls"`
	CategoryID  *string  `json:"categoryId"`
	IsActive    *bool    `json:"isActive"`
}

type BulkUpdateProductDTO struct {
	ProductIDs []string         `json:"productIds" binding:"required"`
	Updates    BulkUpdateFields `json:"updates" binding:"required"`
}

type BulkUpdateFields struct {
	Price      *float64 `json:"price"`
	Stock      *int     `json:"stock"`
	IsActive   *bool    `json:"isActive"`
	CategoryID *string  `json:"categoryId"`
}

type BulkUpdateResponse struct {
	UpdatedCount int64    `json:"updatedCount"`
	FailedIDs    []string `json:"failedIds,omitempty"`
	Errors       []string `json:"errors,omitempty"`
}

type ProductResponse struct {
	ID            string    `json:"id"`
	ShopID        string    `json:"shopId"`
	CategoryID    string    `json:"categoryId"`
	Name          string    `json:"name"`
	Slug          string    `json:"slug"`
	Description   string    `json:"description"`
	SKU           string    `json:"sku"`
	FavoriteCount int       `json:"favoriteCount"`
	ReviewCount   int       `json:"reviewCount"`
	RatingAverage float64   `json:"ratingAverage"`
	IsActive      bool      `json:"isActive"`
	Price         float64   `json:"price,omitempty"`
	Currency      string    `json:"currency,omitempty"`
	Stock         int       `json:"stock,omitempty"`
	ImageURLs     []string  `json:"imageUrls,omitempty"`
	CategoryName  string    `json:"categoryName,omitempty"`
	ShopName      string    `json:"shopName,omitempty"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}