package main

import (
	"catalog-service/internal/cache"
	"catalog-service/internal/coreclient"
	"catalog-service/internal/rabbitmq"
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
	"context"
	"log"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

type productEventPublisher struct {
	publisher rabbitmq.Publisher
}

func (p productEventPublisher) PublishProductCreated(ctx context.Context, payload product.ProductEventPayload) error {
	return p.publisher.PublishProductCreated(ctx, toRabbitProductPayload(payload))
}

func (p productEventPublisher) PublishProductUpdated(ctx context.Context, payload product.ProductEventPayload) error {
	return p.publisher.PublishProductUpdated(ctx, toRabbitProductPayload(payload))
}

func (p productEventPublisher) PublishProductDeleted(ctx context.Context, payload product.ProductEventPayload) error {
	return p.publisher.PublishProductDeleted(ctx, toRabbitProductPayload(payload))
}

func toRabbitProductPayload(payload product.ProductEventPayload) rabbitmq.ProductEventPayload {
	return rabbitmq.ProductEventPayload{
		ProductID:   payload.ProductID,
		Name:        payload.Name,
		ShopID:      payload.ShopID,
		CategoryID:  payload.CategoryID,
		Description: payload.Description,
		SKU:         payload.SKU,
		IsActive:    payload.IsActive,
	}
}

func Routes(
	r *gin.RouterGroup,
	db *mongo.Database,
	coreSvc coreclient.Client,
	redisCache cache.Cache,
) {
	publisher, err := rabbitmq.NewPublisher()
	var productPublishers []product.ProductEventPublisher
	if err != nil {
		log.Printf("RabbitMQ publisher unavailable: %v", err)
	} else {
		productPublishers = append(productPublishers, productEventPublisher{publisher: publisher})
	}

	category.CategoryRouter(r, db, coreSvc, redisCache)
	product.ProductRouter(r, db, coreSvc, redisCache, productPublishers...)
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
