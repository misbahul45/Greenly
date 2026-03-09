package databases

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Base struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	CreatedAt time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updatedAt"`
	DeletedAt *time.Time         `bson:"deleted_at,omitempty" json:"deletedAt,omitempty"`
}

type Category struct {
	Base
	Name     string              `bson:"name" json:"name"`
	Slug     string              `bson:"slug" json:"slug"`
	ParentID *primitive.ObjectID `bson:"parent_id,omitempty" json:"parentId,omitempty"`
}

type Product struct {
	Base

	ShopID     primitive.ObjectID `bson:"shop_id" json:"shopId"`
	CategoryID primitive.ObjectID `bson:"category_id" json:"categoryId"`

	Name        string `bson:"name" json:"name"`
	Description string `bson:"description" json:"description"`
	SKU         string `bson:"sku" json:"sku"`

	IsActive bool `bson:"is_active" json:"isActive"`

	InventoryID *primitive.ObjectID  `bson:"inventory_id,omitempty" json:"inventoryId,omitempty"`
	PriceID     *primitive.ObjectID  `bson:"price_id,omitempty" json:"priceId,omitempty"`
	ImageIDs    []primitive.ObjectID `bson:"image_ids,omitempty" json:"imageIds,omitempty"`
	DiscountIDs []primitive.ObjectID `bson:"discount_ids,omitempty" json:"discountIds,omitempty"`
	EcoID       *primitive.ObjectID  `bson:"eco_id,omitempty" json:"ecoId,omitempty"`
}

type ProductImage struct {
	Base
	ProductID primitive.ObjectID `bson:"product_id" json:"productId"`
	URL       string             `bson:"url" json:"url"`
	IsPrimary bool               `bson:"is_primary" json:"isPrimary"`
}

type Inventory struct {
	Base
	ProductID     primitive.ObjectID `bson:"product_id" json:"productId"`
	Stock         int                `bson:"stock" json:"stock"`
	ReservedStock int                `bson:"reserved_stock" json:"reservedStock"`
	Location      string             `bson:"location" json:"location"`
}

type Price struct {
	Base
	ProductID primitive.ObjectID `bson:"product_id" json:"productId"`

	Amount   float64 `bson:"amount" json:"amount"`
	Currency string  `bson:"currency" json:"currency"`
}

type ProductDiscount struct {
	Base
	ProductID primitive.ObjectID `bson:"product_id" json:"productId"`

	Name string `bson:"name" json:"name"`

	Percentage  float64 `bson:"percentage,omitempty" json:"percentage,omitempty"`
	FixedAmount float64 `bson:"fixed_amount,omitempty" json:"fixedAmount,omitempty"`

	ValidFrom time.Time `bson:"valid_from" json:"validFrom"`
	ValidTo   time.Time `bson:"valid_to" json:"validTo"`

	IsActive bool `bson:"is_active" json:"isActive"`
}

type ActivePrice struct {
	ProductID primitive.ObjectID `bson:"product_id" json:"productId"`

	FinalPrice float64   `bson:"final_price" json:"finalPrice"`
	UpdatedAt  time.Time `bson:"updated_at" json:"updatedAt"`
}

type EcoAttribute struct {
	Base
	ProductID primitive.ObjectID `bson:"product_id" json:"productId"`

	CarbonFootprint float64 `bson:"carbon_footprint" json:"carbonFootprint"`
	Recyclable      bool    `bson:"recyclable" json:"recyclable"`
	MaterialType    string  `bson:"material_type" json:"materialType"`
	EcoScore        float64 `bson:"eco_score" json:"ecoScore"`
}