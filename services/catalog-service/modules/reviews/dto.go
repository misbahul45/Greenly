package review

import "time"

type CreateReviewRequest struct {
	ProductID string   `json:"productId" binding:"required"`
	Rating    int      `json:"rating" binding:"required,min=1,max=5"`
	Title     string   `json:"title"`
	Comment   string   `json:"comment"`
	ImageURLs []string `json:"imageUrls"`
	OrderID   string   `json:"orderId"`
}

type UpdateReviewRequest struct {
	Rating    *int      `json:"rating"`
	Title     *string   `json:"title"`
	Comment   *string   `json:"comment"`
	ImageURLs []string  `json:"imageUrls"`
}

type ReviewQuery struct {
	Page       int    `form:"page"`
	Limit      int    `form:"limit"`
	ProductID  string `form:"product_id"`
	UserID     string `form:"user_id"`
	ShopID     string `form:"shop_id"`
	MinRating  int    `form:"min_rating"`
	MaxRating  int    `form:"max_rating"`
	SortBy     string `form:"sort_by"`
	SortOrder  string `form:"sort_order"`
}

type ReviewResponse struct {
	ID          string    `json:"id"`
	ProductID   string    `json:"productId"`
	UserID      string    `json:"userId"`
	OrderID     string    `json:"orderId,omitempty"`
	Rating      int       `json:"rating"`
	Title       string    `json:"title,omitempty"`
	Comment     string    `json:"comment,omitempty"`
	ImageURLs   []string  `json:"imageUrls,omitempty"`
	IsVerified  bool      `json:"isVerified"`
	HelpfulCount int      `json:"helpfulCount"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type ReviewWithProductResponse struct {
	ReviewResponse
	ProductName string `json:"productName"`
	ProductSlug string `json:"productSlug"`
}