package databases

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Base struct {
	ID        primitive.ObjectID  `bson:"_id,omitempty"`
	CreatedAt time.Time           `bson:"created_at"`
	UpdatedAt time.Time           `bson:"updated_at"`
	DeletedAt *time.Time          `bson:"deleted_at,omitempty"`
}

type Category struct {
	Base
	Name     string                `bson:"name"`
	Slug     string                `bson:"slug"`
	ParentID *primitive.ObjectID   `bson:"parent_id,omitempty"`
}

type Product struct {
	Base
	ShopID     primitive.ObjectID   `bson:"shop_id"`
	CategoryID primitive.ObjectID   `bson:"category_id"`

	Name        string               `bson:"name"`
	Description string               `bson:"description"`
	SKU         string               `bson:"sku"`
	IsActive    bool                 `bson:"is_active"`

	InventoryID *primitive.ObjectID  `bson:"inventory_id,omitempty"`
	PriceID     *primitive.ObjectID  `bson:"price_id,omitempty"`
	ImageIDs    []primitive.ObjectID `bson:"image_ids,omitempty"`
	DiscountIDs []primitive.ObjectID `bson:"discount_ids,omitempty"`
	EcoID       *primitive.ObjectID  `bson:"eco_id,omitempty"`
}

type ProductImage struct {
	Base
	ProductID primitive.ObjectID `bson:"product_id"`
	URL       string             `bson:"url"`
	IsPrimary bool               `bson:"is_primary"`
}

type Inventory struct {
	Base
	ProductID     primitive.ObjectID `bson:"product_id"`
	Stock         int                `bson:"stock"`
	ReservedStock int                `bson:"reserved_stock"`
	Location      string             `bson:"location"`
}

type Price struct {
	Base
	ProductID primitive.ObjectID `bson:"product_id"`
	Amount    string             `bson:"amount"`
	Currency  string             `bson:"currency"`
}

type ProductDiscount struct {
	Base
	ProductID   primitive.ObjectID `bson:"product_id"`
	Name        string             `bson:"name"`
	Percentage  float64            `bson:"percentage"`
	FixedAmount float64            `bson:"fixed_amount"`
	ValidFrom   time.Time          `bson:"valid_from"`
	ValidTo     time.Time          `bson:"valid_to"`
	IsActive    bool               `bson:"is_active"`
}

type ActivePrice struct {
	ProductID  primitive.ObjectID `bson:"product_id"`
	FinalPrice string             `bson:"final_price"`
	UpdatedAt  time.Time          `bson:"updated_at"`
}

type EcoAttribute struct {
	Base
	ProductID       primitive.ObjectID `bson:"product_id"`
	CarbonFootprint float64            `bson:"carbon_footprint"`
	Recyclable      bool               `bson:"recyclable"`
	MaterialType    string             `bson:"material_type"`
	EcoScore        float64            `bson:"eco_score"`
}
