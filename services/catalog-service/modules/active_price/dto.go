package activeprice

type ActivePriceResponse struct {
	ID         string  `json:"id"`
	ProductID  string  `json:"productId"`
	FinalPrice float64 `json:"finalPrice"`
	UpdatedAt  string  `json:"updatedAt"`
}

func ToResponse(ap *ActivePrice) ActivePriceResponse {
	return ActivePriceResponse{
		ID:         ap.ID,
		ProductID:  ap.ProductID,
		FinalPrice: ap.FinalPrice,
		UpdatedAt:  ap.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}