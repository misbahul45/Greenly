package main

import (
	"context"
	"log"

	"catalog-service/internal/rabbitmq"
	catalogActivePrice "catalog-service/modules/active_price"
	catalogEcoAttribute "catalog-service/modules/eco_attribute"
	catalogInventory "catalog-service/modules/inventory"
	catalogPrice "catalog-service/modules/price"
	catalogDiscount "catalog-service/modules/product_discount"
	catalogProductImage "catalog-service/modules/product_image"
	catalogProducts "catalog-service/modules/products"

	"go.mongodb.org/mongo-driver/mongo"
)

type priceAccessor struct {
	repo catalogPrice.Repository
}

func (p *priceAccessor) FindByProductID(ctx context.Context, productID string) (catalogActivePrice.PriceInfo, error) {
	price, err := p.repo.FindByProductID(ctx, productID)
	if err != nil {
		return catalogActivePrice.PriceInfo{}, err
	}
	return catalogActivePrice.PriceInfo{
		ID:        price.ID,
		ProductID: price.ProductID,
		Amount:    price.Amount,
		Currency:  price.Currency,
	}, nil
}

func initRabbitMQ(db *mongo.Database) {
	productRepo := catalogProducts.NewRepository(db)
	inventoryRepo := catalogInventory.NewRepository(db)
	priceRepo := catalogPrice.NewRepository(db)
	activePriceRepo := catalogActivePrice.NewRepository(db)
	discountRepo := catalogDiscount.NewRepository(db)
	productImageRepo := catalogProductImage.NewRepository(db)
	ecoAttributeRepo := catalogEcoAttribute.NewRepository(db)

	priceAcc := &priceAccessor{repo: priceRepo}

	productService := catalogProducts.NewService(productRepo)
	inventoryService := catalogInventory.NewService(inventoryRepo)
	priceService := catalogPrice.NewService(priceRepo)
	activePriceService := catalogActivePrice.NewService(activePriceRepo, priceAcc)
	discountService := catalogDiscount.NewService(discountRepo)
	ecoAttributeService := catalogEcoAttribute.NewService(ecoAttributeRepo)
	_ = productImageRepo

	rabbitMQ, err := rabbitmq.NewRabbitMQ(
		productService,
		inventoryService,
		priceService,
		discountService,
		activePriceService,
		ecoAttributeService,
	)
	if err != nil {
		log.Printf("Warning: RabbitMQ not available: %v", err)
		return
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	defer rabbitMQ.Stop()

	if err := rabbitMQ.Start(ctx); err != nil {
		log.Printf("RabbitMQ consumer error: %v", err)
	}
}
