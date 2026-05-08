package productimage

type UploadImageDTO struct {
	ProductID string `form:"productId" binding:"required"`
	Order     int    `form:"order"`
	IsPrimary bool   `form:"isPrimary"`
}

type SetPrimaryDTO struct {
	ImageID string `json:"imageId" binding:"required"`
}

type ReorderDTO struct {
	Orders []ImageOrder `json:"orders" binding:"required"`
}

type ImageOrder struct {
	ImageID string `json:"imageId" binding:"required"`
	Order   int    `json:"order" binding:"gte=0"`
}

type ProductImageResponse struct {
	ID        string `json:"id"`
	ProductID string `json:"productId"`
	URL       string `json:"url"`
	FileID    string `json:"fileId"`
	IsPrimary bool   `json:"isPrimary"`
	Order     int    `json:"order"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

func ToResponse(img *ProductImage) ProductImageResponse {
	return ProductImageResponse{
		ID:        img.ID,
		ProductID: img.ProductID,
		URL:       img.URL,
		FileID:    img.FileID,
		IsPrimary: img.IsPrimary,
		Order:     img.Order,
		CreatedAt: img.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt: img.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}
