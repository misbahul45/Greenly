package activeprice

import (
	"catalog-service/databases"
	"time"
)

type ActivePrice struct {
	ID         string    `bson:"_id,omitempty" json:"id"`
	ProductID  string    `bson:"product_id" json:"productId"`
	FinalPrice float64   `bson:"final_price" json:"finalPrice"`
	UpdatedAt time.Time `bson:"updated_at" json:"updatedAt"`
}

func (ap *ActivePrice) BeforeCreate() {
	ap.ID = databases.NewID()
	ap.UpdatedAt = time.Now()
}

func (ap *ActivePrice) BeforeUpdate() {
	ap.UpdatedAt = time.Now()
}