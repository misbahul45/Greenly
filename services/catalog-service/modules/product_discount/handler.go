package productdiscount

import (
	"catalog-service/middleware"
	"catalog-service/utils"
	"errors"

	"github.com/gin-gonic/gin"
)

type Handler interface {
	FindByProductID(c *gin.Context)
	Create(c *gin.Context)
	Update(c *gin.Context)
	Delete(c *gin.Context)
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
		c.Error(middleware.NewAppError(500, "Failed to fetch discounts", err))
		return
	}
	utils.OK(c, res)
}

func (h *handler) Create(c *gin.Context) {
	var dto CreateDiscountDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid request body", nil))
		return
	}

	res, err := h.service.Create(c.Request.Context(), dto)
	if err != nil {
		c.Error(middleware.NewAppError(500, "Failed to create discount", err))
		return
	}
	utils.Created(c, res)
}

func (h *handler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.Error(middleware.NewAppError(400, "id is required", nil))
		return
	}

	var dto UpdateDiscountDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid request body", nil))
		return
	}

	res, err := h.service.Update(c.Request.Context(), id, dto)
	if err != nil {
		if errors.Is(err, ErrDiscountNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to update discount", err))
		return
	}
	utils.OK(c, res)
}

func (h *handler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.Error(middleware.NewAppError(400, "id is required", nil))
		return
	}

	err := h.service.Delete(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, ErrDiscountNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to delete discount", err))
		return
	}
	c.Status(204)
}