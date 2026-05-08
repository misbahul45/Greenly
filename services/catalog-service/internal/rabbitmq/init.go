package rabbitmq

import (
	"context"
	"encoding/json"
	"log"

	catalogActivePrice "catalog-service/modules/active_price"
	catalogEcoAttribute "catalog-service/modules/eco_attribute"
	catalogInventory "catalog-service/modules/inventory"
	catalogPrice "catalog-service/modules/price"
	catalogDiscount "catalog-service/modules/product_discount"
	catalogProducts "catalog-service/modules/products"
)

type RabbitMQ struct {
	Publisher Publisher
	Consumer  Consumer
}

func NewRabbitMQ(
	productService catalogProducts.Service,
	inventoryService catalogInventory.Service,
	priceService catalogPrice.Service,
	discountService catalogDiscount.Service,
	activePriceService catalogActivePrice.Service,
	ecoAttributeService catalogEcoAttribute.Service,
) (*RabbitMQ, error) {
	publisher, err := NewPublisher()
	if err != nil {
		return nil, err
	}

	consumer, err := NewConsumer()
	if err != nil {
		publisher.Close()
		return nil, err
	}

	handlers := NewEventHandlers(
		productService,
		inventoryService,
		priceService,
		discountService,
		activePriceService,
		ecoAttributeService,
	)

	consumer.RegisterHandler("order.created", handlers.HandleOrderCreated)
	consumer.RegisterHandler("order.cancelled", handlers.HandleOrderCancelled)
	consumer.RegisterHandler("promotion.created", handlers.HandlePromotionCreated)
	consumer.RegisterHandler("promotion.activated", handlers.HandlePromotionActivated)
	consumer.RegisterHandler("promotion.expired", handlers.HandlePromotionExpired)
	consumer.RegisterHandler("shop.approved", handlers.HandleShopApproved)

	return &RabbitMQ{
		Publisher: publisher,
		Consumer:  consumer,
	}, nil
}

func (r *RabbitMQ) Start(ctx context.Context) error {
	return r.Consumer.Start(ctx)
}

func (r *RabbitMQ) Stop() error {
	if r.Consumer != nil {
		r.Consumer.Stop()
	}
	if r.Publisher != nil {
		return r.Publisher.Close()
	}
	return nil
}

type EventHandlers struct {
	productService      catalogProducts.Service
	inventoryService    catalogInventory.Service
	priceService        catalogPrice.Service
	discountService     catalogDiscount.Service
	activePriceService  catalogActivePrice.Service
	ecoAttributeService catalogEcoAttribute.Service
}

func NewEventHandlers(
	productService catalogProducts.Service,
	inventoryService catalogInventory.Service,
	priceService catalogPrice.Service,
	discountService catalogDiscount.Service,
	activePriceService catalogActivePrice.Service,
	ecoAttributeService catalogEcoAttribute.Service,
) *EventHandlers {
	return &EventHandlers{
		productService:      productService,
		inventoryService:    inventoryService,
		priceService:        priceService,
		discountService:     discountService,
		activePriceService:  activePriceService,
		ecoAttributeService: ecoAttributeService,
	}
}

func (h *EventHandlers) HandleOrderCreated(ctx context.Context, data json.RawMessage) error {
	var event OrderCreatedEvent
	if err := json.Unmarshal(data, &event); err != nil {
		log.Printf("Failed to unmarshal order.created: %v", err)
		return err
	}

	if event.ProductID != "" && event.Quantity > 0 {
		err := h.inventoryService.ReserveStock(ctx, event.ProductID, event.Quantity)
		if err != nil {
			log.Printf("Failed to reserve stock for order %s: %v", event.OrderID, err)
			return err
		}
		log.Printf("Reserved %d stock for product %s (order: %s)", event.Quantity, event.ProductID, event.OrderID)
	}

	return nil
}

func (h *EventHandlers) HandleOrderCancelled(ctx context.Context, data json.RawMessage) error {
	var event OrderCancelledEvent
	if err := json.Unmarshal(data, &event); err != nil {
		log.Printf("Failed to unmarshal order.cancelled: %v", err)
		return err
	}

	if event.ProductID != "" && event.Quantity > 0 {
		err := h.inventoryService.ReleaseStock(ctx, event.ProductID, event.Quantity)
		if err != nil {
			log.Printf("Failed to release stock for order %s: %v", event.OrderID, err)
			return err
		}
		log.Printf("Released %d stock for product %s (order: %s)", event.Quantity, event.ProductID, event.OrderID)
	}

	return nil
}

func (h *EventHandlers) HandlePromotionCreated(ctx context.Context, data json.RawMessage) error {
	var event PromotionCreatedEvent
	if err := json.Unmarshal(data, &event); err != nil {
		log.Printf("Failed to unmarshal promotion.created: %v", err)
		return err
	}

	log.Printf("Promotion created: %s (type: %s, discount: %.2f)", event.Code, event.Type, event.DiscountVal)

	return nil
}

func (h *EventHandlers) HandlePromotionActivated(ctx context.Context, data json.RawMessage) error {
	var event PromotionActivatedEvent
	if err := json.Unmarshal(data, &event); err != nil {
		log.Printf("Failed to unmarshal promotion.activated: %v", err)
		return err
	}

	log.Printf("Promotion activated: %s", event.Code)
	h.activePriceService.RecalculateForAllProducts(ctx)

	return nil
}

func (h *EventHandlers) HandlePromotionExpired(ctx context.Context, data json.RawMessage) error {
	var event PromotionExpiredEvent
	if err := json.Unmarshal(data, &event); err != nil {
		log.Printf("Failed to unmarshal promotion.expired: %v", err)
		return err
	}

	log.Printf("Promotion expired: %s", event.Code)
	h.activePriceService.RecalculateForAllProducts(ctx)

	return nil
}

func (h *EventHandlers) HandleShopApproved(ctx context.Context, data json.RawMessage) error {
	var event ShopApprovedEvent
	if err := json.Unmarshal(data, &event); err != nil {
		log.Printf("Failed to unmarshal shop.approved: %v", err)
		return err
	}

	log.Printf("Shop approved: %s", event.ShopID)

	err := h.productService.EnableProductsByShop(ctx, event.ShopID)
	if err != nil {
		log.Printf("Failed to enable products for shop %s: %v", event.ShopID, err)
		return err
	}

	log.Printf("Enabled products for approved shop %s", event.ShopID)
	return nil
}
