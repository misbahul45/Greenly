package price

import (
	"catalog-service/databases"
	"time"
)

type Price struct {
	ID        string    `bson:"_id,omitempty" json:"id"`
	ProductID string    `bson:"product_id" json:"productId"`
	Amount    float64   `bson:"amount" json:"amount"`
	Currency  string    `bson:"currency" json:"currency"`
	CreatedAt time.Time `bson:"created_at" json:"createdAt"`
	UpdatedAt time.Time `bson:"updated_at" json:"updatedAt"`
	DeletedAt *time.Time `bson:"deleted_at,omitempty" json:"deletedAt,omitempty"`
}

func (p *Price) BeforeCreate() {
	p.ID = databases.NewID()
	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()
}

func (p *Price) BeforeUpdate() {
	p.UpdatedAt = time.Now()
}