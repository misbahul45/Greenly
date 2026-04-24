package main

import (
	"catalog-service/internal/coreclient"
	activeprice "catalog-service/modules/active_price"
	category "catalog-service/modules/categories"
	ecoattribute "catalog-service/modules/eco_attribute"
	inventory "catalog-service/modules/inventory"
	price "catalog-service/modules/price"
	discount "catalog-service/modules/product_discount"
	productimage "catalog-service/modules/product_image"
	product "catalog-service/modules/products"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func Routes(
	r *gin.RouterGroup,
	db *mongo.Database,
	coreSvc coreclient.Client,
) {
	category.CategoryRouter(r, db)
	product.ProductRouter(r, db, coreSvc)
	inventory.InventoryRouter(r, db)
	price.PriceRouter(r, db)
	activeprice.ActivePriceRouter(r, db)
	discount.ProductDiscountRouter(r, db)
	productimage.ProductImageRouter(r, db)
	ecoattribute.EcoAttributeRouter(r, db)
}
