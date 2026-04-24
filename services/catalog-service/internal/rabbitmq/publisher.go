package rabbitmq

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type Publisher interface {
	PublishProductCreated(ctx context.Context, payload ProductEventPayload) error
	PublishProductUpdated(ctx context.Context, payload ProductEventPayload) error
	PublishProductDeleted(ctx context.Context, payload ProductEventPayload) error
	PublishInventoryUpdated(ctx context.Context, payload InventoryEventPayload) error
	PublishPriceUpdated(ctx context.Context, payload PriceEventPayload) error
	PublishDiscountApplied(ctx context.Context, payload DiscountEventPayload) error
	PublishProductImageUploaded(ctx context.Context, payload ProductImageEventPayload) error
	PublishProductImageDeleted(ctx context.Context, payload ProductImageEventPayload) error
	PublishEcoAttributeUpdated(ctx context.Context, payload EcoAttributeEventPayload) error
	PublishMLProductCreated(ctx context.Context, payload MLProductEventPayload) error
	PublishMLProductUpdated(ctx context.Context, payload MLProductEventPayload) error
	PublishMLInventoryUpdated(ctx context.Context, payload MLInventoryEventPayload) error
	PublishMLPriceUpdated(ctx context.Context, payload MLPriceEventPayload) error
	PublishMLDiscountApplied(ctx context.Context, payload MLDiscountEventPayload) error
	Close() error
}

type publisher struct {
	conn    *amqp.Connection
	channel *amqp.Channel
}

type ProductEventPayload struct {
	ProductID   string `json:"productId"`
	Name        string `json:"name"`
	ShopID      string `json:"shopId"`
	CategoryID  string `json:"categoryId"`
	Description string `json:"description"`
	SKU         string `json:"sku"`
	IsActive    bool   `json:"isActive"`
	Timestamp   string `json:"timestamp"`
	Source      string `json:"source"`
	Version     string `json:"version"`
}

type InventoryEventPayload struct {
	ProductID     string `json:"productId"`
	Stock         int    `json:"stock"`
	ReservedStock int    `json:"reservedStock"`
	Timestamp     string `json:"timestamp"`
	Source        string `json:"source"`
	Version       string `json:"version"`
}

type PriceEventPayload struct {
	ProductID string  `json:"productId"`
	Amount    float64 `json:"amount"`
	Currency  string  `json:"currency"`
	Timestamp string  `json:"timestamp"`
	Source    string  `json:"source"`
	Version   string  `json:"version"`
}

type DiscountEventPayload struct {
	ProductID   string  `json:"productId"`
	DiscountID  string  `json:"discountId"`
	Percentage  float64 `json:"percentage,omitempty"`
	FixedAmount float64 `json:"fixedAmount,omitempty"`
	ValidFrom   string  `json:"validFrom"`
	ValidTo     string  `json:"validTo"`
	IsActive    bool    `json:"isActive"`
	Timestamp   string  `json:"timestamp"`
	Source      string  `json:"source"`
	Version     string  `json:"version"`
}

type MLProductEventPayload struct {
	ProductID   string                 `json:"productId"`
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	CategoryID  string                 `json:"categoryId"`
	ShopID      string                 `json:"shopId"`
	SKU         string                 `json:"sku"`
	Features    map[string]interface{} `json:"features"`
	Timestamp   string                 `json:"timestamp"`
	Source      string                 `json:"source"`
	Version     string                 `json:"version"`
}

type MLInventoryEventPayload struct {
	ProductID string `json:"productId"`
	Stock     int    `json:"stock"`
	Timestamp string `json:"timestamp"`
	Source    string `json:"source"`
	Version   string `json:"version"`
}

type MLPriceEventPayload struct {
	ProductID string  `json:"productId"`
	Price     float64 `json:"price"`
	Timestamp string  `json:"timestamp"`
	Source    string  `json:"source"`
	Version   string  `json:"version"`
}

type MLDiscountEventPayload struct {
	ProductID string  `json:"productId"`
	Discount  float64 `json:"discount"`
	Timestamp string  `json:"timestamp"`
	Source    string  `json:"source"`
	Version   string  `json:"version"`
}

type ProductImageEventPayload struct {
	ImageID   string `json:"imageId"`
	ProductID string `json:"productId"`
	URL       string `json:"url"`
	FileID    string `json:"fileId"`
	IsPrimary bool   `json:"isPrimary"`
	Timestamp string `json:"timestamp"`
	Source    string `json:"source"`
	Version   string `json:"version"`
}

type EcoAttributeEventPayload struct {
	ProductID       string  `json:"productId"`
	CarbonFootprint float64 `json:"carbonFootprint"`
	Recyclable      bool    `json:"recyclable"`
	MaterialType    string  `json:"materialType"`
	EcoScore        float64 `json:"ecoScore"`
	Timestamp       string  `json:"timestamp"`
	Source          string  `json:"source"`
	Version         string  `json:"version"`
}

func NewPublisher() (Publisher, error) {
	rabbitURL := os.Getenv("RABBITMQ_URL")
	if rabbitURL == "" {
		rabbitURL = "amqp://guest:guest@localhost:5672/"
	}

	conn, err := amqp.Dial(rabbitURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to open channel: %w", err)
	}

	err = ch.ExchangeDeclare(
		"greenly_events",
		"topic",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("failed to declare exchange: %w", err)
	}

	return &publisher{
		conn:    conn,
		channel: ch,
	}, nil
}

func (p *publisher) publish(ctx context.Context, routingKey string, payload interface{}) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	err = p.channel.PublishWithContext(
		ctx,
		"greenly_events",
		routingKey,
		false,
		false,
		amqp.Publishing{
			ContentType:  "application/json",
			Body:         body,
			Timestamp:    time.Now(),
			DeliveryMode: amqp.Persistent,
		},
	)
	if err != nil {
		return fmt.Errorf("failed to publish message: %w", err)
	}

	log.Printf("Published event: %s", routingKey)
	return nil
}

func (p *publisher) PublishProductCreated(ctx context.Context, payload ProductEventPayload) error {
	payload.Timestamp = time.Now().UTC().Format(time.RFC3339)
	payload.Source = "catalog-service"
	payload.Version = "1.0"
	return p.publish(ctx, "product.created", payload)
}

func (p *publisher) PublishProductUpdated(ctx context.Context, payload ProductEventPayload) error {
	payload.Timestamp = time.Now().UTC().Format(time.RFC3339)
	payload.Source = "catalog-service"
	payload.Version = "1.0"
	return p.publish(ctx, "product.updated", payload)
}

func (p *publisher) PublishProductDeleted(ctx context.Context, payload ProductEventPayload) error {
	payload.Timestamp = time.Now().UTC().Format(time.RFC3339)
	payload.Source = "catalog-service"
	payload.Version = "1.0"
	return p.publish(ctx, "product.deleted", payload)
}

func (p *publisher) PublishInventoryUpdated(ctx context.Context, payload InventoryEventPayload) error {
	payload.Timestamp = time.Now().UTC().Format(time.RFC3339)
	payload.Source = "catalog-service"
	payload.Version = "1.0"
	return p.publish(ctx, "inventory.updated", payload)
}

func (p *publisher) PublishPriceUpdated(ctx context.Context, payload PriceEventPayload) error {
	payload.Timestamp = time.Now().UTC().Format(time.RFC3339)
	payload.Source = "catalog-service"
	payload.Version = "1.0"
	return p.publish(ctx, "price.updated", payload)
}

func (p *publisher) PublishDiscountApplied(ctx context.Context, payload DiscountEventPayload) error {
	payload.Timestamp = time.Now().UTC().Format(time.RFC3339)
	payload.Source = "catalog-service"
	payload.Version = "1.0"
	return p.publish(ctx, "discount.applied", payload)
}

func (p *publisher) PublishMLProductCreated(ctx context.Context, payload MLProductEventPayload) error {
	payload.Timestamp = time.Now().UTC().Format(time.RFC3339)
	payload.Source = "catalog-service"
	payload.Version = "1.0"
	return p.publish(ctx, "ml.product.created", payload)
}

func (p *publisher) PublishMLProductUpdated(ctx context.Context, payload MLProductEventPayload) error {
	payload.Timestamp = time.Now().UTC().Format(time.RFC3339)
	payload.Source = "catalog-service"
	payload.Version = "1.0"
	return p.publish(ctx, "ml.product.updated", payload)
}

func (p *publisher) PublishMLInventoryUpdated(ctx context.Context, payload MLInventoryEventPayload) error {
	payload.Timestamp = time.Now().UTC().Format(time.RFC3339)
	payload.Source = "catalog-service"
	payload.Version = "1.0"
	return p.publish(ctx, "ml.inventory.updated", payload)
}

func (p *publisher) PublishMLPriceUpdated(ctx context.Context, payload MLPriceEventPayload) error {
	payload.Timestamp = time.Now().UTC().Format(time.RFC3339)
	payload.Source = "catalog-service"
	payload.Version = "1.0"
	return p.publish(ctx, "ml.price.updated", payload)
}

func (p *publisher) PublishMLDiscountApplied(ctx context.Context, payload MLDiscountEventPayload) error {
	payload.Timestamp = time.Now().UTC().Format(time.RFC3339)
	payload.Source = "catalog-service"
	payload.Version = "1.0"
	return p.publish(ctx, "ml.discount.applied", payload)
}

func (p *publisher) PublishProductImageUploaded(ctx context.Context, payload ProductImageEventPayload) error {
	payload.Timestamp = time.Now().UTC().Format(time.RFC3339)
	payload.Source = "catalog-service"
	payload.Version = "1.0"
	return p.publish(ctx, "product.image.uploaded", payload)
}

func (p *publisher) PublishProductImageDeleted(ctx context.Context, payload ProductImageEventPayload) error {
	payload.Timestamp = time.Now().UTC().Format(time.RFC3339)
	payload.Source = "catalog-service"
	payload.Version = "1.0"
	return p.publish(ctx, "product.image.deleted", payload)
}

func (p *publisher) PublishEcoAttributeUpdated(ctx context.Context, payload EcoAttributeEventPayload) error {
	payload.Timestamp = time.Now().UTC().Format(time.RFC3339)
	payload.Source = "catalog-service"
	payload.Version = "1.0"
	return p.publish(ctx, "product.eco_attribute.updated", payload)
}

func (p *publisher) Close() error {
	if p.channel != nil {
		p.channel.Close()
	}
	if p.conn != nil {
		return p.conn.Close()
	}
	return nil
}
