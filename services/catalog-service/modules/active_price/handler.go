package activeprice

import (
	"catalog-service/middleware"
	"catalog-service/utils"
	"errors"

	"github.com/gin-gonic/gin"
)

type Handler interface {
	FindByProductID(c *gin.Context)
	Recalculate(c *gin.Context)
	RecalculateAll(c *gin.Context)
}

type handler struct {
	service Service
}

func NewHandler(service Service) Handler {
	return &handler{service: service}
}

func (h *handler) FindByProductID(c *gin.Context) {
	productID := c.Param("productId")
	if productID == "" {
		c.Error(middleware.NewAppError(400, "productId is required", nil))
		return
	}

	res, err := h.service.GetByProductID(c.Request.Context(), productID)
	if err != nil {
		if errors.Is(err, ErrActivePriceNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to fetch active price", err))
		return
	}
	utils.OK(c, res)
}

func (h *handler) Recalculate(c *gin.Context) {
	productID := c.Param("productId")
	if productID == "" {
		c.Error(middleware.NewAppError(400, "productId is required", nil))
		return
	}

	err := h.service.Recalculate(c.Request.Context(), productID)
	if err != nil {
		c.Error(middleware.NewAppError(500, "Failed to recalculate active price", err))
		return
	}
	utils.OK(c, gin.H{"message": "Active price recalculated"})
}

func (h *handler) RecalculateAll(c *gin.Context) {
	err := h.service.RecalculateForAllProducts(c.Request.Context())
	if err != nil {
		c.Error(middleware.NewAppError(500, "Failed to recalculate all active prices", err))
		return
	}
	utils.OK(c, gin.H{"message": "All active prices recalculated"})
}