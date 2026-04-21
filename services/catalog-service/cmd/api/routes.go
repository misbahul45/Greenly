package main

import (
	"catalog-service/internal/coreclient"
	category "catalog-service/modules/categories"
	product "catalog-service/modules/products"
	inventory "catalog-service/modules/inventory"
	price "catalog-service/modules/price"
	activeprice "catalog-service/modules/active_price"
	discount "catalog-service/modules/product_discount"

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
}