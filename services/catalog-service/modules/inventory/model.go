package inventory

import (
	"catalog-service/databases"
	"time"
)

type Inventory struct {
	ID                string    `bson:"_id,omitempty" json:"id"`
	ProductID         string    `bson:"product_id" json:"productId"`
	Stock             int       `bson:"stock" json:"stock"`
	ReservedStock     int       `bson:"reserved_stock" json:"reservedStock"`
	LowStockThreshold int       `bson:"low_stock_threshold" json:"lowStockThreshold"`
	CreatedAt         time.Time `bson:"created_at" json:"createdAt"`
	UpdatedAt         time.Time `bson:"updated_at" json:"updatedAt"`
	DeletedAt         *time.Time `bson:"deleted_at,omitempty" json:"deletedAt,omitempty"`
}

func (i *Inventory) BeforeCreate() {
	i.ID = databases.NewID()
	i.CreatedAt = time.Now()
	i.UpdatedAt = time.Now()
}

func (i *Inventory) BeforeUpdate() {
	i.UpdatedAt = time.Now()
}

func (i *Inventory) IsLowStock() bool {
	return i.Stock <= i.LowStockThreshold && i.LowStockThreshold > 0
}

func (i *Inventory) AvailableStock() int {
	available := i.Stock - i.ReservedStock
	if available < 0 {
		return 0
	}
	return available
}