package ecoattribute

import (
	"catalog-service/databases"
	"time"
)

type EcoAttribute struct {
	ID              string     `bson:"_id,omitempty" json:"id"`
	ProductID       string     `bson:"product_id" json:"productId"`
	CarbonFootprint float64    `bson:"carbon_footprint" json:"carbonFootprint"`
	Recyclable      bool       `bson:"recyclable" json:"recyclable"`
	MaterialType    string     `bson:"material_type" json:"materialType"`
	EcoScore        float64    `bson:"eco_score" json:"ecoScore"`
	CreatedAt       time.Time  `bson:"created_at" json:"createdAt"`
	UpdatedAt       time.Time  `bson:"updated_at" json:"updatedAt"`
	DeletedAt       *time.Time `bson:"deleted_at,omitempty" json:"deletedAt,omitempty"`
}

func (e *EcoAttribute) BeforeCreate() {
	e.ID = databases.NewID()
	e.CreatedAt = time.Now()
	e.UpdatedAt = time.Now()
}

func (e *EcoAttribute) BeforeUpdate() {
	e.UpdatedAt = time.Now()
}
