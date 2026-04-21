package price

type CreatePriceDTO struct {
	ProductID string  `json:"productId" binding:"required"`
	Amount    float64 `json:"amount" binding:"required,gte=0"`
	Currency  string  `json:"currency"`
}

type UpdatePriceDTO struct {
	Amount   *float64 `json:"amount"`
	Currency *string  `json:"currency"`
}

type PriceResponse struct {
	ID        string  `json:"id"`
	ProductID string  `json:"productId"`
	Amount    float64 `json:"amount"`
	Currency  string  `json:"currency"`
	CreatedAt string  `json:"createdAt"`
	UpdatedAt string  `json:"updatedAt"`
}

func ToResponse(p *Price) PriceResponse {
	return PriceResponse{
		ID:        p.ID,
		ProductID: p.ProductID,
		Amount:    p.Amount,
		Currency:  p.Currency,
		CreatedAt:  p.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt: p.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}