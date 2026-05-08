package productrating

import (
	"catalog-service/middleware"
	"catalog-service/utils"
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler interface {
	GetByProductID(c *gin.Context)
	GetProductsRatings(c *gin.Context)
	GetTopRatedProducts(c *gin.Context)
}

type handler struct {
	service Service
}

func NewHandler(service Service) Handler {
	return &handler{service: service}
}

func (h *handler) GetByProductID(c *gin.Context) {
	productID := c.Param("productId")
	if productID == "" {
		c.Error(middleware.NewAppError(400, "productId is required", nil))
		return
	}

	res, err := h.service.GetByProductID(c.Request.Context(), productID)
	if err != nil {
		c.Error(middleware.NewAppError(500, "Failed to fetch rating", err))
		return
	}
	utils.OK(c, res)
}

func (h *handler) GetProductsRatings(c *gin.Context) {
	var dto struct {
		ProductIDs []string `json:"productIds" binding:"required"`
	}
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.Error(middleware.NewAppError(400, "productIds is required", nil))
		return
	}

	res, err := h.service.GetProductsRatings(c.Request.Context(), dto.ProductIDs)
	if err != nil {
		c.Error(middleware.NewAppError(500, "Failed to fetch ratings", err))
		return
	}
	utils.OK(c, res)
}

func (h *handler) GetTopRatedProducts(c *gin.Context) {
	limit := 10
	if l := c.Query("limit"); l != "" {
		parsed, err := strconv.Atoi(l)
		if err != nil || parsed <= 0 {
			c.Error(middleware.NewAppError(400, "Invalid limit param", nil))
			return
		}
		limit = parsed
	}

	res, err := h.service.GetTopRatedProducts(c.Request.Context(), limit)
	if err != nil {
		if errors.Is(err, ErrRatingNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to fetch top rated products", err))
		return
	}
	utils.OK(c, res)
}
