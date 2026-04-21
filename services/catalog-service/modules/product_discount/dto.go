package productdiscount

import "time"

type CreateDiscountDTO struct {
	ProductID  string    `json:"productId" binding:"required"`
	Name       string    `json:"name" binding:"required"`
	Percentage float64   `json:"percentage"`
	FixedAmount float64   `json:"fixedAmount"`
	ValidFrom  time.Time `json:"validFrom" binding:"required"`
	ValidTo    time.Time `json:"validTo" binding:"required"`
}

type UpdateDiscountDTO struct {
	Name       *string   `json:"name"`
	Percentage *float64  `json:"percentage"`
	FixedAmount *float64  `json:"fixedAmount"`
	ValidFrom  *time.Time `json:"validFrom"`
	ValidTo    *time.Time `json:"validTo"`
	IsActive   *bool     `json:"isActive"`
}

type ProductDiscountResponse struct {
	ID          string  `json:"id"`
	ProductID  string  `json:"productId"`
	Name       string  `json:"name"`
	Percentage float64 `json:"percentage"`
	FixedAmount float64 `json:"fixedAmount"`
	ValidFrom  string  `json:"validFrom"`
	ValidTo    string  `json:"validTo"`
	IsActive   bool    `json:"isActive"`
	CreatedAt  string  `json:"createdAt"`
	UpdatedAt string  `json:"updatedAt"`
}

func ToResponse(d *ProductDiscount) ProductDiscountResponse {
	return ProductDiscountResponse{
		ID:          d.ID,
		ProductID:  d.ProductID,
		Name:       d.Name,
		Percentage: d.Percentage,
		FixedAmount: d.FixedAmount,
		ValidFrom:  d.ValidFrom.Format("2006-01-02T15:04:05Z"),
		ValidTo:    d.ValidTo.Format("2006-01-02T15:04:05Z"),
		IsActive:   d.IsActive,
		CreatedAt: d.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt: d.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}