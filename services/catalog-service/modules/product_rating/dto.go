package productrating

import "time"

type ProductRatingResponse struct {
	ProductID string    `json:"productId"`
	Average   float64   `json:"average"`
	Count     int       `json:"count"`
	OneStar   int       `json:"oneStar"`
	TwoStar   int       `json:"twoStar"`
	ThreeStar int       `json:"threeStar"`
	FourStar  int       `json:"fourStar"`
	FiveStar  int       `json:"fiveStar"`
	UpdatedAt time.Time `json:"updatedAt"`
}
