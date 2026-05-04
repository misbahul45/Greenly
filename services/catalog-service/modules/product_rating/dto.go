package productrating

import "time"

type ProductRatingResponse struct {
	ProductID string  `json:"productId"`
	Average   float64 `json:"average"`
	Count     int     `json:"count"`
	OneStar   int     `bson:"one_star" json:"oneStar"`
	TwoStar   int     `bson:"two_star" json:"twoStar"`
	ThreeStar int     `bson:"three_star" json:"threeStar"`
	FourStar  int     `bson:"four_star" json:"fourStar"`
	FiveStar  int     `bson:"five_star" json:"fiveStar"`
	UpdatedAt time.Time `json:"updatedAt"`
}