package rabbitmq

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type EventHandler func(ctx context.Context, data json.RawMessage) error

const (
	DefaultRequeueLimit = 3
	DefaultRequeueDelay = 5
)

type Consumer interface {
	Start(ctx context.Context) error
	Stop() error
	RegisterHandler(eventName string, handler EventHandler)
}

type consumer struct {
	conn         *amqp.Connection
	channel      *amqp.Channel
	queue        amqp.Queue
	handlers     map[string]EventHandler
	noAck        bool
	requeueLimit int
	requeueDelay time.Duration
}

func NewConsumer() (Consumer, error) {
	rabbitURL := os.Getenv("RABBITMQ_URL")
	if rabbitURL == "" {
		rabbitURL = "amqp://guest:guest@localhost:5672/"
	}

	noAck := os.Getenv("RABBITMQ_NO_ACK")
	manualAck := noAck != "true"

	requeueLimit := DefaultRequeueLimit
	if limit := os.Getenv("RABBITMQ_REQUEUE_LIMIT"); limit != "" {
		if n, err := strconv.Atoi(limit); err == nil && n > 0 {
			requeueLimit = n
		}
	}
	requeueDelay := DefaultRequeueDelay * time.Second
	if delay := os.Getenv("RABBITMQ_REQUEUE_DELAY"); delay != "" {
		if d, err := strconv.Atoi(delay); err == nil && d > 0 {
			requeueDelay = time.Duration(d) * time.Second
		}
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

	if err := ch.ExchangeDeclare("greenly_events", "topic", true, false, false, false, nil); err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("failed to declare exchange: %w", err)
	}

	if err := ch.ExchangeDeclare("greenly_events_dlx", "topic", true, false, false, false, nil); err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("failed to declare DLX: %w", err)
	}

	dlq, err := ch.QueueDeclare("catalog_service_dlq", true, false, false, false, nil)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("failed to declare DLQ: %w", err)
	}

	if err := ch.QueueBind(dlq.Name, "#", "greenly_events_dlx", false, nil); err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("failed to bind DLQ: %w", err)
	}

	if err := ch.Qos(10, 0, manualAck); err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("failed to set QoS: %w", err)
	}

	return &consumer{
		conn:         conn,
		channel:      ch,
		handlers:     make(map[string]EventHandler),
		noAck:        !manualAck,
		requeueLimit: requeueLimit,
		requeueDelay: requeueDelay,
	}, nil
}

func (c *consumer) Start(ctx context.Context) error {
	args := amqp.Table{"x-dead-letter-exchange": "greenly_events_dlx"}
	q, err := c.channel.QueueDeclare("catalog_service_queue", true, false, false, false, args)
	if err != nil {
		c.channel.Close()
		c.conn.Close()
		return fmt.Errorf("failed to declare main queue: %w", err)
	}
	c.queue = q

	routingKeys := []string{
		"order.created",
		"order.cancelled",
		"promotion.created",
		"promotion.expired",
		"shop.approved",
	}

	for _, key := range routingKeys {
		if err := c.bindRoutingKey(key); err != nil {
			return fmt.Errorf("failed to bind routing key %s: %w", key, err)
		}
		log.Printf("Bound to routing key: %s", key)
	}

	msgs, err := c.channel.Consume(c.queue.Name, "", c.noAck, false, false, false, nil)
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

func (c *consumer) failWithRetry(msg amqp.Delivery, retryCount int, reason error) {
	if retryCount+1 >= c.requeueLimit {
		log.Printf("Dropping %s after %d attempts: %v", msg.RoutingKey, retryCount+1, reason)
		_ = msg.Nack(false, false)
		return
	}

	delay := c.requeueDelay * time.Duration(1<<uint(retryCount))
	log.Printf("Retrying %s in %v (attempt %d/%d): %v", msg.RoutingKey, delay, retryCount+1, c.requeueLimit, reason)

	select {
	case <-time.After(delay):
		msg.Headers = amqp.Table{"x-retry-count": int32(retryCount + 1)}
		_ = msg.Nack(false, true)
	case <-time.After(30 * time.Second):
		_ = msg.Nack(false, true)
	}
}

func (c *consumer) RegisterHandler(eventName string, handler EventHandler) {
	c.handlers[eventName] = handler
}

func (c *consumer) bindRoutingKey(routingKey string) error {
	return c.channel.QueueBind(c.queue.Name, routingKey, "greenly_events", false, nil)
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

	retryCount := 0
	if count, ok := msg.Headers["x-retry-count"].(int32); ok {
		retryCount = int(count)
	}

	err := handler(ctx, data)
	if err != nil {
		log.Printf("Handler error for %s: %v", eventName, err)
		c.failWithRetry(msg, retryCount, err)
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
	EventID     string             `json:"eventId"`
	OrderID     string             `json:"orderId"`
	UserID      string             `json:"userId"`
	ShopID      string             `json:"shopId"`
	ProductID   string             `json:"productId"`
	Quantity    int                `json:"quantity"`
	TotalAmount string             `json:"totalAmount"`
	Timestamp   string             `json:"timestamp"`
	Items       []OrderCreatedItem `json:"items"`
}

type OrderCreatedItem struct {
	ProductID string `json:"productId"`
	Quantity  int    `json:"quantity"`
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
	PromotionID        string   `json:"promotionId"`
	Code               string   `json:"code"`
	Type               string   `json:"type"`
	DiscountVal        float64  `json:"discountVal"`
	EligibleProductIDs []string `json:"eligibleProductIds"`
	StartDate          string   `json:"startDate"`
	EndDate            string   `json:"endDate"`
	Timestamp          string   `json:"timestamp"`
}

type PromotionActivatedEvent struct {
	PromotionID        string   `json:"promotionId"`
	Code               string   `json:"code"`
	Type               string   `json:"type"`
	DiscountVal        float64  `json:"discountVal"`
	EligibleProductIDs []string `json:"eligibleProductIds"`
	StartDate          string   `json:"startDate"`
	EndDate            string   `json:"endDate"`
	Timestamp          string   `json:"timestamp"`
}

type PromotionExpiredEvent struct {
	PromotionID string `json:"promotionId"`
	Code        string `json:"code"`
	Timestamp   string `json:"timestamp"`
}

type ShopApprovedEvent struct {
	ShopID     string `json:"shopId"`
	ShopName   string `json:"shopName"`
	ApprovedBy string `json:"approvedBy"`
	Timestamp  string `json:"timestamp"`
}

type PaymentCompletedEvent struct {
	PaymentID string `json:"paymentId"`
	OrderID   string `json:"orderId"`
	Amount    string `json:"amount"`
	Method    string `json:"method"`
	Timestamp string `json:"timestamp"`
}
