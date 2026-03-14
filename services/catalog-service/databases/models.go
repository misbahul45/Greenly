package databases

import (
	"context"
	"time"

	"github.com/lucsky/cuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func NewID() string {
	return cuid.New()
}

type Base struct {
	ID        string     `bson:"_id,omitempty" json:"id"`
	CreatedAt time.Time  `bson:"created_at" json:"createdAt"`
	UpdatedAt time.Time  `bson:"updated_at" json:"updatedAt"`
	DeletedAt *time.Time `bson:"deleted_at,omitempty" json:"deletedAt,omitempty"`
}

func (b *Base) BeforeCreate() {
	now := time.Now()

	if b.ID == "" {
		b.ID = NewID()
	}

	b.CreatedAt = now
	b.UpdatedAt = now
}

func (b *Base) BeforeUpdate() {
	b.UpdatedAt = time.Now()
}

type Category struct {
	Base

	Name     string  `bson:"name" json:"name"`
	Slug     string  `bson:"slug" json:"slug"`
	ParentID *string `bson:"parent_id,omitempty" json:"parentId,omitempty"`
}

type Product struct {
	Base

	ShopID     string `bson:"shop_id" json:"shopId"`
	CategoryID string `bson:"category_id" json:"categoryId"`

	Name        string `bson:"name" json:"name"`
	Slug        string `bson:"slug" json:"slug"`
	Description string `bson:"description" json:"description"`
	SKU         string `bson:"sku" json:"sku"`

	FavoriteCount int     `bson:"favorite_count" json:"favoriteCount"`
	ReviewCount   int     `bson:"review_count" json:"reviewCount"`
	RatingAverage float64 `bson:"rating_average" json:"ratingAverage"`

	IsActive bool `bson:"is_active" json:"isActive"`

	InventoryID *string  `bson:"inventory_id,omitempty" json:"inventoryId,omitempty"`
	PriceID     *string  `bson:"price_id,omitempty" json:"priceId,omitempty"`
	ImageIDs    []string `bson:"image_ids,omitempty" json:"imageIds,omitempty"`
	DiscountIDs []string `bson:"discount_ids,omitempty" json:"discountIds,omitempty"`
	EcoID       *string  `bson:"eco_id,omitempty" json:"ecoId,omitempty"`
}

type ProductVariant struct {
	Base

	ProductID string `bson:"product_id" json:"productId"`

	Name string `bson:"name" json:"name"`
	SKU  string `bson:"sku" json:"sku"`

	PriceID     *string `bson:"price_id,omitempty" json:"priceId,omitempty"`
	InventoryID *string `bson:"inventory_id,omitempty" json:"inventoryId,omitempty"`

	ImageIDs []string `bson:"image_ids,omitempty" json:"imageIds,omitempty"`

	IsActive bool `bson:"is_active" json:"isActive"`
}

type ProductImage struct {
	Base

	ProductID  string `bson:"product_id" json:"productId"`
	ProductKey string `bson:"product_key" json:"productKey"`

	URL string `bson:"url" json:"url"`

	IsPrimary bool `bson:"is_primary" json:"isPrimary"`
	Order     int  `bson:"order" json:"order"`
}

type Inventory struct {
	Base

	ProductID string `bson:"product_id" json:"productId"`

	Stock         int `bson:"stock" json:"stock"`
	ReservedStock int `bson:"reserved_stock" json:"reservedStock"`

	Location string `bson:"location" json:"location"`
}

type Price struct {
	Base

	ProductID string `bson:"product_id" json:"productId"`

	Amount   float64 `bson:"amount" json:"amount"`
	Currency string  `bson:"currency" json:"currency"`
}

type ProductDiscount struct {
	Base

	ProductID string `bson:"product_id" json:"productId"`

	Name string `bson:"name" json:"name"`

	Percentage  float64 `bson:"percentage,omitempty" json:"percentage,omitempty"`
	FixedAmount float64 `bson:"fixed_amount,omitempty" json:"fixedAmount,omitempty"`

	ValidFrom time.Time `bson:"valid_from" json:"validFrom"`
	ValidTo   time.Time `bson:"valid_to" json:"validTo"`

	IsActive bool `bson:"is_active" json:"isActive"`
}

type ActivePrice struct {
	ProductID string `bson:"product_id" json:"productId"`

	FinalPrice float64   `bson:"final_price" json:"finalPrice"`
	UpdatedAt  time.Time `bson:"updated_at" json:"updatedAt"`
}

type EcoAttribute struct {
	Base

	ProductID string `bson:"product_id" json:"productId"`

	CarbonFootprint float64 `bson:"carbon_footprint" json:"carbonFootprint"`
	Recyclable      bool    `bson:"recyclable" json:"recyclable"`

	MaterialType string  `bson:"material_type" json:"materialType"`
	EcoScore     float64 `bson:"eco_score" json:"ecoScore"`
}

type FavoriteProduct struct {
	Base

	UserID    string `bson:"user_id" json:"userId"`
	ProductID string `bson:"product_id" json:"productId"`
	ShopID    string `bson:"shop_id" json:"shopId"`
}

type ProductReview struct {
	Base

	ProductID string `bson:"product_id" json:"productId"`
	UserID    string `bson:"user_id" json:"userId"`

	OrderID string `bson:"order_id,omitempty" json:"orderId,omitempty"`

	Rating int `bson:"rating" json:"rating"`

	Title   string `bson:"title,omitempty" json:"title,omitempty"`
	Comment string `bson:"comment,omitempty" json:"comment,omitempty"`

	ImageURLs []string `bson:"image_urls,omitempty" json:"imageUrls,omitempty"`

	IsVerified bool `bson:"is_verified" json:"isVerified"`

	HelpfulCount int `bson:"helpful_count" json:"helpfulCount"`
}

type ReviewReply struct {
	Base

	ReviewID string `bson:"review_id" json:"reviewId"`
	ShopID   string `bson:"shop_id" json:"shopId"`

	Message string `bson:"message" json:"message"`
}

type ProductRating struct {
	ProductID string `bson:"product_id" json:"productId"`

	Average float64 `bson:"average" json:"average"`
	Count   int     `bson:"count" json:"count"`

	OneStar   int `bson:"one_star"`
	TwoStar   int `bson:"two_star"`
	ThreeStar int `bson:"three_star"`
	FourStar  int `bson:"four_star"`
	FiveStar  int `bson:"five_star"`

	UpdatedAt time.Time `bson:"updated_at" json:"updatedAt"`
}

type ProductView struct {
	Base

	ProductID string  `bson:"product_id"`
	UserID    *string `bson:"user_id,omitempty"`

	Source string `bson:"source"`
}

type ProductAnalytics struct {
	ProductID string `bson:"product_id"`

	ViewCount int `bson:"view_count"`

	LastViewedAt time.Time `bson:"last_viewed_at"`
}

func CreateFavoriteIndexes(collection *mongo.Collection) error {

	indexes := []mongo.IndexModel{

		{
			Keys: bson.D{
				{Key: "user_id", Value: 1},
				{Key: "product_id", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},

		{
			Keys: bson.D{
				{Key: "user_id", Value: 1},
			},
		},

		{
			Keys: bson.D{
				{Key: "product_id", Value: 1},
			},
		},
	}

	_, err := collection.Indexes().CreateMany(context.Background(), indexes)

	return err
}