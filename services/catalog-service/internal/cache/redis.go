package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

type Cache interface {
	GetProduct(ctx context.Context, id string) (string, error)
	SetProduct(ctx context.Context, id string, data interface{}, ttl time.Duration) error
	DeleteProduct(ctx context.Context, id string) error

	GetProductList(ctx context.Context, key string) (string, error)
	SetProductList(ctx context.Context, key string, data interface{}, ttl time.Duration) error
	DeleteProductList(ctx context.Context, key string) error

	GetPrice(ctx context.Context, productID string) (string, error)
	SetPrice(ctx context.Context, productID string, data interface{}, ttl time.Duration) error
	DeletePrice(ctx context.Context, productID string) error

	GetInventory(ctx context.Context, productID string) (string, error)
	SetInventory(ctx context.Context, productID string, data interface{}, ttl time.Duration) error
	DeleteInventory(ctx context.Context, productID string) error

	GetActivePrice(ctx context.Context, productID string) (string, error)
	SetActivePrice(ctx context.Context, productID string, data interface{}, ttl time.Duration) error
	DeleteActivePrice(ctx context.Context, productID string) error

	DeletePattern(ctx context.Context, pattern string) error
	GetUser(ctx context.Context, token string) (string, error)
	SetUser(ctx context.Context, token string, data interface{}, ttl time.Duration) error
	DeleteUser(ctx context.Context, token string) error
	Close() error
}

type redisCache struct {
	client *redis.Client
}

func NewCache() (Cache, error) {
	host := os.Getenv("REDIS_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("REDIS_PORT")
	if port == "" {
		port = "6379"
	}

	client := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", host, port),
		Password: "",
		DB:       0,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := client.Ping(ctx).Err()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return &redisCache{
		client: client,
	}, nil
}

func (c *redisCache) GetProduct(ctx context.Context, id string) (string, error) {
	key := fmt.Sprintf("product:%s", id)
	return c.client.Get(ctx, key).Result()
}

func (c *redisCache) SetProduct(ctx context.Context, id string, data interface{}, ttl time.Duration) error {
	key := fmt.Sprintf("product:%s", id)
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	return c.client.Set(ctx, key, jsonData, ttl).Err()
}

func (c *redisCache) DeleteProduct(ctx context.Context, id string) error {
	key := fmt.Sprintf("product:%s", id)
	return c.client.Del(ctx, key).Err()
}

func (c *redisCache) GetProductList(ctx context.Context, key string) (string, error) {
	cacheKey := fmt.Sprintf("products:list:%s", key)
	return c.client.Get(ctx, cacheKey).Result()
}

func (c *redisCache) SetProductList(ctx context.Context, key string, data interface{}, ttl time.Duration) error {
	cacheKey := fmt.Sprintf("products:list:%s", key)
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	return c.client.Set(ctx, cacheKey, jsonData, ttl).Err()
}

func (c *redisCache) DeleteProductList(ctx context.Context, key string) error {
	cacheKey := fmt.Sprintf("products:list:%s", key)
	return c.client.Del(ctx, cacheKey).Err()
}

func (c *redisCache) GetPrice(ctx context.Context, productID string) (string, error) {
	key := fmt.Sprintf("price:%s", productID)
	return c.client.Get(ctx, key).Result()
}

func (c *redisCache) SetPrice(ctx context.Context, productID string, data interface{}, ttl time.Duration) error {
	key := fmt.Sprintf("price:%s", productID)
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	return c.client.Set(ctx, key, jsonData, ttl).Err()
}

func (c *redisCache) DeletePrice(ctx context.Context, productID string) error {
	key := fmt.Sprintf("price:%s", productID)
	return c.client.Del(ctx, key).Err()
}

func (c *redisCache) GetInventory(ctx context.Context, productID string) (string, error) {
	key := fmt.Sprintf("inventory:%s", productID)
	return c.client.Get(ctx, key).Result()
}

func (c *redisCache) SetInventory(ctx context.Context, productID string, data interface{}, ttl time.Duration) error {
	key := fmt.Sprintf("inventory:%s", productID)
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	return c.client.Set(ctx, key, jsonData, ttl).Err()
}

func (c *redisCache) DeleteInventory(ctx context.Context, productID string) error {
	key := fmt.Sprintf("inventory:%s", productID)
	return c.client.Del(ctx, key).Err()
}

func (c *redisCache) GetActivePrice(ctx context.Context, productID string) (string, error) {
	key := fmt.Sprintf("active_price:%s", productID)
	return c.client.Get(ctx, key).Result()
}

func (c *redisCache) SetActivePrice(ctx context.Context, productID string, data interface{}, ttl time.Duration) error {
	key := fmt.Sprintf("active_price:%s", productID)
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	return c.client.Set(ctx, key, jsonData, ttl).Err()
}

func (c *redisCache) DeleteActivePrice(ctx context.Context, productID string) error {
	key := fmt.Sprintf("active_price:%s", productID)
	return c.client.Del(ctx, key).Err()
}

func (c *redisCache) DeletePattern(ctx context.Context, pattern string) error {
	iter := c.client.Scan(ctx, 0, pattern, 0).Iterator()
	var keys []string
	for iter.Next(ctx) {
		keys = append(keys, iter.Val())
	}
	if err := iter.Err(); err != nil {
		return err
	}
	if len(keys) > 0 {
		return c.client.Del(ctx, keys...).Err()
	}
	return nil
}

func (c *redisCache) GetUser(ctx context.Context, token string) (string, error) {
	key := fmt.Sprintf("user:%s", token)
	return c.client.Get(ctx, key).Result()
}

func (c *redisCache) SetUser(ctx context.Context, token string, data any, ttl time.Duration) error {
	key := fmt.Sprintf("user:%s", token)
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	return c.client.Set(ctx, key, jsonData, ttl).Err()
}

func (c *redisCache) DeleteUser(ctx context.Context, token string) error {
	key := fmt.Sprintf("user:%s", token)
	return c.client.Del(ctx, key).Err()
}

func (c *redisCache) Close() error {
	return c.client.Close()
}
