package coreclient

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type Client interface {
	GetShop(ctx context.Context, shopID string) (*Shop, error)
	ValidateShopMembership(ctx context.Context, shopID, userID string) (*ShopMembership, error)
	GetMe(ctx context.Context, token string) (*User, error)
}

type Shop struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Status  string `json:"status"`
	OwnerID string `json:"ownerId"`
}

type ShopMembership struct {
	ShopID string   `json:"shopId"`
	UserID string   `json:"userId"`
	Roles  []string `json:"roles"`
}

type User struct {
	ID    string   `json:"id"`
	Email string   `json:"email"`
	Roles []string `json:"roles"`
}

type client struct {
	baseURL    string
	httpClient *http.Client
}

func NewClient(baseURL string) Client {
	return &client{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (c *client) GetShop(ctx context.Context, shopID string) (*Shop, error) {
	url := fmt.Sprintf("%s/shops/%s", c.baseURL, shopID)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get shop: status %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	var result struct {
		Data Shop `json:"data"`
	}
	if err := json.Unmarshal(bodyBytes, &result); err != nil {
		return nil, err
	}

	return &result.Data, nil
}

func (c *client) ValidateShopMembership(ctx context.Context, shopID, userID string) (*ShopMembership, error) {
	url := fmt.Sprintf("%s/shops/%s/members/%s", c.baseURL, shopID, userID)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, fmt.Errorf("user is not a member of this shop")
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to validate membership: status %d", resp.StatusCode)
	}

	var membership ShopMembership
	if err := json.NewDecoder(resp.Body).Decode(&membership); err != nil {
		return nil, err
	}

	return &membership, nil
}

func (c *client) GetMe(ctx context.Context, token string) (*User, error) {
	url := fmt.Sprintf("%s/auth/me", c.baseURL)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode == http.StatusUnauthorized {
		return nil, fmt.Errorf("unauthorized: %s", string(body))
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed: %d | %s", resp.StatusCode, string(body))
	}

	var envelope struct {
		Data *User `json:"data"`
	}
	if err := json.Unmarshal(body, &envelope); err != nil {
		return nil, err
	}

	return envelope.Data, nil
}