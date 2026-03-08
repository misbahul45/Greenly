package product


type CreateProductDTO struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	SKU         string `json:"sku"`
	IsActive    bool   `json:"isActive"`
	CategoryID  string `json:"categoryId"`
	Price       *PriceInfo       `json:"price,omitempty"`
	Inventory   *InventoryInfo   `json:"inventory,omitempty"`
	Images      []ImageInfo      `json:"images,omitempty"`
}

type UpdateProductDTO struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	SKU         string `json:"sku"`
	IsActive    bool   `json:"isActive"`
	CategoryID  string `json:"categoryId"`
	Price       *PriceInfo       `json:"price,omitempty"`
	Inventory   *InventoryInfo   `json:"inventory,omitempty"`
	Images      []ImageInfo      `json:"images,omitempty"`
}


type ProductQuery struct {
	Page   int
	Limit  int
	Search string
}