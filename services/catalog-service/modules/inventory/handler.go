package inventory

import (
	"catalog-service/middleware"
	"catalog-service/utils"
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler interface {
	GetByProductID(c *gin.Context)
	Create(c *gin.Context)
	Update(c *gin.Context)
	ReserveStock(c *gin.Context)
	ReleaseStock(c *gin.Context)
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
		if errors.Is(err, ErrInventoryNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to fetch inventory", err))
		return
	}
	utils.OK(c, res)
}

func (h *handler) Create(c *gin.Context) {
	var dto CreateInventoryDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid request body", nil))
		return
	}

	res, err := h.service.Create(c.Request.Context(), dto)
	if err != nil {
		c.Error(middleware.NewAppError(500, "Failed to create inventory", err))
		return
	}
	utils.Created(c, res)
}

func (h *handler) Update(c *gin.Context) {
	productID := c.Param("productId")
	if productID == "" {
		c.Error(middleware.NewAppError(400, "productId is required", nil))
		return
	}

	var dto UpdateInventoryDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid request body", nil))
		return
	}

	res, err := h.service.Update(c.Request.Context(), productID, dto)
	if err != nil {
		if errors.Is(err, ErrInventoryNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to update inventory", err))
		return
	}
	utils.OK(c, res)
}

func (h *handler) ReserveStock(c *gin.Context) {
	productID := c.Param("productId")
	if productID == "" {
		c.Error(middleware.NewAppError(400, "productId is required", nil))
		return
	}

	quantityStr := c.PostForm("quantity")
	quantity, err := strconv.Atoi(quantityStr)
	if err != nil || quantity <= 0 {
		c.Error(middleware.NewAppError(400, "quantity is required and must be positive", nil))
		return
	}

	reserveErr := h.service.ReserveStock(c.Request.Context(), productID, quantity)
	if reserveErr != nil {
		c.Error(middleware.NewAppError(500, "Failed to reserve stock", reserveErr))
		return
	}
	utils.OK(c, gin.H{"message": "Stock reserved"})
}

func (h *handler) ReleaseStock(c *gin.Context) {
	productID := c.Param("productId")
	if productID == "" {
		c.Error(middleware.NewAppError(400, "productId is required", nil))
		return
	}

	quantityStr := c.PostForm("quantity")
	quantity, err := strconv.Atoi(quantityStr)
	if err != nil || quantity <= 0 {
		c.Error(middleware.NewAppError(400, "quantity is required and must be positive", nil))
		return
	}

	releaseErr := h.service.ReleaseStock(c.Request.Context(), productID, quantity)
	if releaseErr != nil {
		c.Error(middleware.NewAppError(500, "Failed to release stock", releaseErr))
		return
	}
	utils.OK(c, gin.H{"message": "Stock released"})
}