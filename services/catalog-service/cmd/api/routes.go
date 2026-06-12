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

// productEventPublisher adapts rabbitmq.Publisher to product.ProductEventPublisher
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

// inventoryEventPublisher adapts rabbitmq.Publisher to inventory.InventoryEventPublisher
type inventoryEventPublisher struct {
	publisher rabbitmq.Publisher
}

func (p inventoryEventPublisher) PublishInventoryUpdated(ctx context.Context, productID string, stock int) error {
	return p.publisher.PublishInventoryUpdated(ctx, rabbitmq.InventoryEventPayload{
		ProductID: productID,
		Stock:     stock,
	})
}

// priceEventPublisher adapts rabbitmq.Publisher to price.PriceEventPublisher
type priceEventPublisher struct {
	publisher rabbitmq.Publisher
}

func (p priceEventPublisher) PublishPriceUpdated(ctx context.Context, productID string, amount float64, currency string) error {
	return p.publisher.PublishPriceUpdated(ctx, rabbitmq.PriceEventPayload{
		ProductID: productID,
		Amount:    amount,
		Currency:  currency,
	})
}

// discountEventPublisher adapts rabbitmq.Publisher to discount.DiscountEventPublisher
type discountEventPublisher struct {
	publisher rabbitmq.Publisher
}

func (p discountEventPublisher) PublishDiscountApplied(ctx context.Context, productID string, percentage float64, fixedAmount float64) error {
	return p.publisher.PublishDiscountApplied(ctx, rabbitmq.DiscountEventPayload{
		ProductID:   productID,
		Percentage:  percentage,
		FixedAmount: fixedAmount,
		IsActive:    true,
	})
}

// ecoAttrEventPublisher adapts rabbitmq.Publisher to ecoattribute.EcoAttrEventPublisher
type ecoAttrEventPublisher struct {
	publisher rabbitmq.Publisher
}

func (p ecoAttrEventPublisher) PublishEcoAttributeUpdated(ctx context.Context, productID string, ecoScore float64, materialType string, recyclable bool, carbonFootprint float64) error {
	return p.publisher.PublishEcoAttributeUpdated(ctx, rabbitmq.EcoAttributeEventPayload{
		ProductID:       productID,
		EcoScore:        ecoScore,
		MaterialType:    materialType,
		Recyclable:      recyclable,
		CarbonFootprint: carbonFootprint,
	})
}

func Routes(
	r *gin.RouterGroup,
	db *mongo.Database,
	coreSvc coreclient.Client,
	redisCache cache.Cache,
) {
	pub, err := rabbitmq.NewPublisher()
	if err != nil {
		log.Printf("RabbitMQ publisher unavailable: %v", err)
	}

	category.CategoryRouter(r, db, coreSvc, redisCache)

	if pub != nil {
		product.ProductRouter(r, db, coreSvc, redisCache, productEventPublisher{publisher: pub})
		inventory.InventoryRouter(r, db, coreSvc, redisCache, inventoryEventPublisher{publisher: pub})
		price.PriceRouter(r, db, coreSvc, redisCache, priceEventPublisher{publisher: pub})
		discount.ProductDiscountRouter(r, db, coreSvc, redisCache, discountEventPublisher{publisher: pub})
		ecoattribute.EcoAttributeRouter(r, db, coreSvc, redisCache, ecoAttrEventPublisher{publisher: pub})
	} else {
		product.ProductRouter(r, db, coreSvc, redisCache)
		inventory.InventoryRouter(r, db, coreSvc, redisCache)
		price.PriceRouter(r, db, coreSvc, redisCache)
		discount.ProductDiscountRouter(r, db, coreSvc, redisCache)
		ecoattribute.EcoAttributeRouter(r, db, coreSvc, redisCache)
	}

	activeprice.ActivePriceRouter(r, db)
	productimage.ProductImageRouter(r, db, coreSvc, redisCache)
	favorite.FavoriteRouter(r, db, coreSvc, redisCache)
	review.ReviewRouter(r, db, coreSvc, redisCache)
	productrating.ProductRatingRouter(r, db)
}
