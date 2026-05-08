package inventory

type CreateInventoryDTO struct {
	ProductID         string `json:"productId" binding:"required"`
	Stock             int    `json:"stock" binding:"gte=0"`
	LowStockThreshold int    `json:"lowStockThreshold"`
}

type UpdateInventoryDTO struct {
	Stock             *int   `json:"stock"`
	LowStockThreshold *int   `json:"lowStockThreshold"`
}

type InventoryResponse struct {
	ID                string `json:"id"`
	ProductID         string `json:"productId"`
	Stock             int    `json:"stock"`
	ReservedStock     int    `json:"reservedStock"`
	AvailableStock    int    `json:"availableStock"`
	LowStockThreshold int    `json:"lowStockThreshold"`
	IsLowStock        bool   `json:"isLowStock"`
	CreatedAt         string `json:"createdAt"`
	UpdatedAt         string `json:"updatedAt"`
}

func ToResponse(inv *Inventory) InventoryResponse {
	return InventoryResponse{
		ID:                inv.ID,
		ProductID:         inv.ProductID,
		Stock:             inv.Stock,
		ReservedStock:     inv.ReservedStock,
		AvailableStock:    inv.AvailableStock(),
		LowStockThreshold: inv.LowStockThreshold,
		IsLowStock:        inv.IsLowStock(),
		CreatedAt:         inv.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:         inv.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}