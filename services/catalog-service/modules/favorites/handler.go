package favorite

import (
	"catalog-service/middleware"
	"catalog-service/utils"
	"errors"

	"github.com/gin-gonic/gin"
)

type Handler interface {
	Toggle(c *gin.Context)
	GetUserFavorites(c *gin.Context)
	GetProductFavorites(c *gin.Context)
	CheckFavorite(c *gin.Context)
}

type handler struct {
	service Service
}

func NewHandler(service Service) Handler {
	return &handler{service: service}
}

func (h *handler) Toggle(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.Error(middleware.NewAppError(401, "Unauthorized", nil))
		return
	}

	var dto ToggleFavoriteRequest
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid request body", nil))
		return
	}

	res, err := h.service.Toggle(c.Request.Context(), userID.(string), dto.ProductID)
	if err != nil {
		if errors.Is(err, ErrProductNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to toggle favorite", err))
		return
	}
	utils.OK(c, res)
}

func (h *handler) GetUserFavorites(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.Error(middleware.NewAppError(401, "Unauthorized", nil))
		return
	}

	var query FavoriteQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid query params", nil))
		return
	}

	if query.Page <= 0 {
		query.Page = 1
	}
	if query.Limit <= 0 || query.Limit > 100 {
		query.Limit = 20
	}

	res, total, err := h.service.GetUserFavorites(c.Request.Context(), userID.(string), query)
	if err != nil {
		c.Error(middleware.NewAppError(500, "Failed to fetch favorites", err))
		return
	}

	meta := utils.NewPaginationMeta(total, int64(query.Page), int64(query.Limit))
	utils.OKWithMeta(c, FavoriteListResponse{Favorites: res}, meta)
}

func (h *handler) GetProductFavorites(c *gin.Context) {
	productID := c.Param("productId")
	if productID == "" {
		c.Error(middleware.NewAppError(400, "productId is required", nil))
		return
	}

	res, err := h.service.GetProductFavorites(c.Request.Context(), productID)
	if err != nil {
		c.Error(middleware.NewAppError(500, "Failed to fetch favorites", err))
		return
	}
	utils.OK(c, res)
}

func (h *handler) CheckFavorite(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.Error(middleware.NewAppError(401, "Unauthorized", nil))
		return
	}

	productID := c.Param("productId")
	if productID == "" {
		c.Error(middleware.NewAppError(400, "productId is required", nil))
		return
	}

	isFav, err := h.service.IsFavorite(c.Request.Context(), userID.(string), productID)
	if err != nil {
		c.Error(middleware.NewAppError(500, "Failed to check favorite", err))
		return
	}
	utils.OK(c, gin.H{"isFavorite": isFav, "productId": productID})
}
