package rabbitmq

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	amqp "github.com/rabbitmq/amqp091-go"
)

type EventHandler func(ctx context.Context, data json.RawMessage) error

type Consumer interface {
	Start(ctx context.Context) error
	Stop() error
	RegisterHandler(eventName string, handler EventHandler)
}

type consumer struct {
	conn      *amqp.Connection
	channel  *amqp.Channel
	queue    amqp.Queue
	handlers map[string]EventHandler
	noAck    bool
}

func NewConsumer() (Consumer, error) {
	rabbitURL := os.Getenv("RABBITMQ_URL")
	if rabbitURL == "" {
		rabbitURL = "amqp://guest:guest@localhost:5672/"
	}

	noAck := os.Getenv("RABBITMQ_NO_ACK")
	manualAck := noAck != "true"

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

	q, err := ch.QueueDeclare(
		"catalog_service_queue",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("failed to declare queue: %w", err)
	}

	err = ch.Qos(10, 0, manualAck)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("failed to set QoS: %w", err)
	}

	return &consumer{
		conn:      conn,
		channel:  ch,
		queue:    q,
		handlers: make(map[string]EventHandler),
		noAck:    !manualAck,
	}, nil
}

func (c *consumer) RegisterHandler(eventName string, handler EventHandler) {
	c.handlers[eventName] = handler
}

func (c *consumer) bindRoutingKey(routingKey string) error {
	return c.channel.QueueBind(
		c.queue.Name,
		routingKey,
		"greenly_events",
		false,
		nil,
	)
}

func (c *consumer) Start(ctx context.Context) error {
	routingKeys := []string{
		"order.created",
		"order.cancelled",
		"order.status.changed",
		"promotion.created",
		"promotion.activated",
		"promotion.expired",
		"promotion.updated",
		"shop.approved",
		"shop.created",
		"payment.completed",
		"payment.failed",
	}

	for _, key := range routingKeys {
		err := c.bindRoutingKey(key)
		if err != nil {
			return fmt.Errorf("failed to bind routing key %s: %w", key, err)
		}
		log.Printf("Bound to routing key: %s", key)
	}

	msgs, err := c.channel.Consume(
		c.queue.Name,
		"",
		c.noAck,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return fmt.Errorf("failed to register consumer: %w", err)
	}

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	log.Println("Consumer started, waiting for messages...")

	go func() {
		for {
			select {
			case <-ctx.Done():
				log.Println("Context cancelled, stopping consumer")
				return
			case <-sigChan:
				log.Println("Received shutdown signal")
				return
			case msg, ok := <-msgs:
				if !ok {
					log.Println("Channel closed")
					return
				}
				c.handleMessage(ctx, msg)
			}
		}
	}()

	return nil
}

func (c *consumer) handleMessage(ctx context.Context, msg amqp.Delivery) {
	eventName := msg.RoutingKey
	handler, exists := c.handlers[eventName]
	if !exists {
		log.Printf("No handler for event: %s", eventName)
		msg.Nack(false, false)
		return
	}

	var data json.RawMessage
	if err := json.Unmarshal(msg.Body, &data); err != nil {
		log.Printf("Failed to unmarshal event %s: %v", eventName, err)
		msg.Nack(false, false)
		return
	}

	err := handler(ctx, data)
	if err != nil {
		log.Printf("Handler error for %s: %v", eventName, err)
	(msg).Nack(false, true)
		return
	}

	if !c.noAck {
		msg.Ack(false)
	}
	log.Printf("Successfully processed event: %s", eventName)
}

func (c *consumer) Stop() error {
	if c.channel != nil {
		c.channel.Close()
	}
	if c.conn != nil {
		return c.conn.Close()
	}
	return nil
}

type OrderCreatedEvent struct {
	OrderID    string `json:"orderId"`
	UserID     string `json:"userId"`
	ShopID     string `json:"shopId"`
	ProductID  string `json:"productId"`
	Quantity   int    `json:"quantity"`
	TotalAmount string `json:"totalAmount"`
	Timestamp  string `json:"timestamp"`
}

type OrderCancelledEvent struct {
	OrderID   string `json:"orderId"`
	ShopID    string `json:"shopId"`
	ProductID string `json:"productId"`
	Quantity  int    `json:"quantity"`
	Reason    string `json:"reason"`
	Timestamp string `json:"timestamp"`
}

type PromotionCreatedEvent struct {
	PromotionID      string   `json:"promotionId"`
	Code             string   `json:"code"`
	Type             string   `json:"type"`
	DiscountVal      float64  `json:"discountVal"`
	EligibleProductIDs []string `json:"eligibleProductIds"`
	StartDate        string   `json:"startDate"`
	EndDate          string   `json:"endDate"`
	Timestamp       string   `json:"timestamp"`
}

type PromotionActivatedEvent struct {
	PromotionID      string   `json:"promotionId"`
	Code             string   `json:"code"`
	Type             string   `json:"type"`
	DiscountVal      float64  `json:"discountVal"`
	EligibleProductIDs []string `json:"eligibleProductIds"`
	StartDate        string   `json:"startDate"`
	EndDate          string   `json:"endDate"`
	Timestamp       string   `json:"timestamp"`
}

type PromotionExpiredEvent struct {
	PromotionID string `json:"promotionId"`
	Code        string `json:"code"`
	Timestamp   string `json:"timestamp"`
}

type ShopApprovedEvent struct {
	ShopID   string `json:"shopId"`
	ShopName string `json:"shopName"`
	ApprovedBy string `json:"approvedBy"`
	Timestamp string `json:"timestamp"`
}

type PaymentCompletedEvent struct {
	PaymentID string `json:"paymentId"`
	OrderID   string `json:"orderId"`
	Amount   string `json:"amount"`
	Method   string `json:"method"`
	Timestamp string `json:"timestamp"`
}