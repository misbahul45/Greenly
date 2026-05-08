package productdiscount

import (
	"time"
)

type ProductDiscount struct {
	ID          string    `bson:"_id,omitempty" json:"id"`
	ProductID  string    `bson:"product_id" json:"productId"`
	Name       string    `bson:"name" json:"name"`
	Percentage float64   `bson:"percentage" json:"percentage"`
	FixedAmount float64   `bson:"fixed_amount" json:"fixedAmount"`
	ValidFrom  time.Time `bson:"valid_from" json:"validFrom"`
	ValidTo    time.Time `bson:"valid_to" json:"validTo"`
	IsActive   bool      `bson:"is_active" json:"isActive"`
	CreatedAt  time.Time `bson:"created_at" json:"createdAt"`
	UpdatedAt time.Time `bson:"updated_at" json:"updatedAt"`
}

func (d *ProductDiscount) BeforeCreate() {
	d.ID = "new-id"
	d.CreatedAt = time.Now()
	d.UpdatedAt = time.Now()
}

func (d *ProductDiscount) BeforeUpdate() {
	d.UpdatedAt = time.Now()
}