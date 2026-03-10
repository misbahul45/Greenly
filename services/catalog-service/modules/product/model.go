package product

import (
	"time"

	"catalog-service/utils"
)

type CategoryInfo struct {
	ID   string `json:"id"`
	Name string             `json:"name"`
	Slug string             `json:"slug"`
}

type PriceInfo struct {
	Amount   string `json:"amount"`
	Currency string `json:"currency"`
}

type InventoryInfo struct {
	Stock         int `json:"stock"`
	ReservedStock int `json:"reservedStock"`
}

type ImageInfo struct {
	URL       string `json:"url"`
	IsPrimary bool   `json:"isPrimary"`
}

type ResponseProduct struct {
	ID          string `json:"id"`
	Name        string             `json:"name"`
	Description string             `json:"description"`
	SKU         string             `json:"sku"`
	IsActive    bool               `json:"isActive"`

	Category CategoryInfo `json:"category"`

	Price     *PriceInfo     `json:"price,omitempty"`
	Inventory *InventoryInfo `json:"inventory,omitempty"`

	Images []ImageInfo `json:"images,omitempty"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type FindManyProductsResponse struct {
	Items []ResponseProduct `json:"items"`
	Meta  utils.PaginationMeta `json:"meta"`
}

