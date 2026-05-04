package main

import (
	"catalog-service/internal/cache"
	"catalog-service/internal/coreclient"
	activeprice "catalog-service/modules/active_price"
	category "catalog-service/modules/categories"
	ecoattribute "catalog-service/modules/eco_attribute"
	favorite "catalog-service/modules/favorites"
	inventory "catalog-service/modules/inventory"
	price "catalog-service/modules/price"
	discount "catalog-service/modules/product_discount"
	productimage "catalog-service/modules/product_image"
	productrating "catalog-service/modules/product_rating"
	product "catalog-service/modules/products"
	review "catalog-service/modules/reviews"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func Routes(
	r *gin.RouterGroup,
	db *mongo.Database,
	coreSvc coreclient.Client,
	redisCache cache.Cache,
) {
	category.CategoryRouter(r, db, coreSvc, redisCache)
	product.ProductRouter(r, db, coreSvc, redisCache)
	inventory.InventoryRouter(r, db, coreSvc, redisCache)
	price.PriceRouter(r, db, coreSvc, redisCache)
	activeprice.ActivePriceRouter(r, db)
	discount.ProductDiscountRouter(r, db, coreSvc, redisCache)
	productimage.ProductImageRouter(r, db, coreSvc, redisCache)
	ecoattribute.EcoAttributeRouter(r, db, coreSvc, redisCache)
	favorite.FavoriteRouter(r, db, coreSvc, redisCache)
	review.ReviewRouter(r, db, coreSvc, redisCache)
	productrating.ProductRatingRouter(r, db)
}
