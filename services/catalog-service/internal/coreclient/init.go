package coreclient
import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type Client interface {
	GetShop(ctx context.Context, shopID string) (*Shop, error)
	ValidateShopMembership(ctx context.Context, shopID, userID string) (*ShopMembership, error)
}

type Shop struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Status string `json:"status"`
	OwnerID string `json:"ownerId"`
}

type ShopMembership struct {
	ShopID string   `json:"shopId"`
	UserID string   `json:"userId"`
	Roles  []string `json:"roles"`
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
	url := fmt.Sprintf("%s/v1/shops/%s", c.baseURL, shopID)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get shop: status %d", resp.StatusCode)
	}

	var shop Shop
	if err := json.NewDecoder(resp.Body).Decode(&shop); err != nil {
		return nil, err
	}

	return &shop, nil
}

func (c *client) ValidateShopMembership(ctx context.Context, shopID, userID string) (*ShopMembership, error) {
	url := fmt.Sprintf("%s/v1/shops/%s/members/%s", c.baseURL, shopID, userID)
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