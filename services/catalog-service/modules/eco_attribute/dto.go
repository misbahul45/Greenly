package ecoattribute

type CreateEcoAttributeDTO struct {
	ProductID       string  `json:"productId" binding:"required"`
	CarbonFootprint float64 `json:"carbonFootprint" binding:"gte=0"`
	Recyclable      bool    `json:"recyclable"`
	MaterialType    string  `json:"materialType" binding:"required"`
	EcoScore        float64 `json:"ecoScore" binding:"gte=0,lte=100"`
}

type UpdateEcoAttributeDTO struct {
	CarbonFootprint *float64 `json:"carbonFootprint"`
	Recyclable      *bool    `json:"recyclable"`
	MaterialType    *string  `json:"materialType"`
	EcoScore        *float64 `json:"ecoScore"`
}

type EcoAttributeResponse struct {
	ID              string  `json:"id"`
	ProductID       string  `json:"productId"`
	CarbonFootprint float64 `json:"carbonFootprint"`
	Recyclable      bool    `json:"recyclable"`
	MaterialType    string  `json:"materialType"`
	EcoScore        float64 `json:"ecoScore"`
	CreatedAt       string  `json:"createdAt"`
	UpdatedAt       string  `json:"updatedAt"`
}

func ToResponse(e *EcoAttribute) EcoAttributeResponse {
	return EcoAttributeResponse{
		ID:              e.ID,
		ProductID:       e.ProductID,
		CarbonFootprint: e.CarbonFootprint,
		Recyclable:      e.Recyclable,
		MaterialType:    e.MaterialType,
		EcoScore:        e.EcoScore,
		CreatedAt:       e.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:       e.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}
