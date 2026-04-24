package ecoattribute

import (
	"catalog-service/middleware"
	"catalog-service/utils"
	"errors"

	"github.com/gin-gonic/gin"
)

type Handler interface {
	GetByProductID(c *gin.Context)
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

func (h *handler) GetByProductID(c *gin.Context) {
	productID := c.Param("productId")
	if productID == "" {
		c.Error(middleware.NewAppError(400, "productId is required", nil))
		return
	}

	res, err := h.service.GetByProductID(c.Request.Context(), productID)
	if err != nil {
		if errors.Is(err, ErrEcoAttributeNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to fetch eco attribute", err))
		return
	}
	utils.OK(c, res)
}

func (h *handler) Create(c *gin.Context) {
	var dto CreateEcoAttributeDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid request body", nil))
		return
	}

	res, err := h.service.Create(c.Request.Context(), dto)
	if err != nil {
		c.Error(middleware.NewAppError(500, "Failed to create eco attribute", err))
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

	var dto UpdateEcoAttributeDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid request body", nil))
		return
	}

	res, err := h.service.Update(c.Request.Context(), productID, dto)
	if err != nil {
		if errors.Is(err, ErrEcoAttributeNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to update eco attribute", err))
		return
	}
	utils.OK(c, res)
}

func (h *handler) Delete(c *gin.Context) {
	productID := c.Param("productId")
	if productID == "" {
		c.Error(middleware.NewAppError(400, "productId is required", nil))
		return
	}

	err := h.service.Delete(c.Request.Context(), productID)
	if err != nil {
		if errors.Is(err, ErrEcoAttributeNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to delete eco attribute", err))
		return
	}
	c.Status(204)
}
