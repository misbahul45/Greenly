package product

type CreateProductDTO struct {
	ShopID     string  `json:"shopId" binding:"required"`
	CategoryID string  `json:"categoryId" binding:"required"`

	Name        string `json:"name" binding:"required"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
	SKU         string `json:"sku" binding:"required"`

	IsActive bool `json:"isActive"`

	InventoryID *string  `json:"inventoryId"`
	PriceID     *string  `json:"priceId"`
	ImageIDs    []string `json:"imageIds"`
	DiscountIDs []string `json:"discountIds"`
	EcoID       *string  `json:"ecoId"`
}

type UpdateProductDTO struct {
	CategoryID *string `json:"categoryId"`

	Name        *string `json:"name"`
	Slug        *string `json:"slug"`
	Description *string `json:"description"`
	SKU         *string `json:"sku"`

	IsActive *bool `json:"isActive"`

	InventoryID *string  `json:"inventoryId"`
	PriceID     *string  `json:"priceId"`
	ImageIDs    []string `json:"imageIds"`
	DiscountIDs []string `json:"discountIds"`
	EcoID       *string  `json:"ecoId"`
}

type ProductQuery struct {
	Page   int    `form:"page"`
	Limit  int    `form:"limit"`
	Search string `form:"search"`

	CategoryID string `form:"categoryId"`
	ShopID     string `form:"shopId"`

	IsActive *bool `form:"isActive"`

	SortBy    string `form:"sortBy"`
	SortOrder string `form:"sortOrder"`
}