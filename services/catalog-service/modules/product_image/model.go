package productimage

import (
	"catalog-service/databases"
	"time"
)

type ProductImage struct {
	ID         string     `bson:"_id,omitempty" json:"id"`
	ProductID  string     `bson:"product_id" json:"productId"`
	ProductKey string     `bson:"product_key" json:"productKey"`
	URL        string     `bson:"url" json:"url"`
	FileID     string     `bson:"file_id" json:"fileId"`
	IsPrimary  bool       `bson:"is_primary" json:"isPrimary"`
	Order      int        `bson:"order" json:"order"`
	CreatedAt  time.Time  `bson:"created_at" json:"createdAt"`
	UpdatedAt  time.Time  `bson:"updated_at" json:"updatedAt"`
	DeletedAt  *time.Time `bson:"deleted_at,omitempty" json:"deletedAt,omitempty"`
}

func (p *ProductImage) BeforeCreate() {
	p.ID = databases.NewID()
	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()
}

func (p *ProductImage) BeforeUpdate() {
	p.UpdatedAt = time.Now()
}
