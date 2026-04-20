package product

import (
	"catalog-service/middleware"
	"catalog-service/utils"
	"errors"

	"github.com/gin-gonic/gin"
)

type Handler interface {
	FindMany(c *gin.Context)
	FindOne(c *gin.Context)
	FindOneBySlug(c *gin.Context)
	Search(c *gin.Context)
	Create(c *gin.Context)
	Update(c *gin.Context)
	Delete(c *gin.Context)
	ToggleProduct(c *gin.Context)
	BulkUpdate(c *gin.Context)
}

type handler struct {
	service Service
}

func NewHandler(service Service) Handler {
	return &handler{service: service}
}

func (h *handler) FindMany(c *gin.Context) {
	var query ProductQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid query params", nil))
		return
	}

	res, total, err := h.service.FindMany(c.Request.Context(), query)
	if err != nil {
		c.Error(middleware.NewAppError(500, "Failed to fetch products", nil))
		return
	}

	meta := utils.NewPaginationMeta(total, int64(query.Page), int64(query.Limit))
	utils.OKWithMeta(c, res, meta)
}

func (h *handler) FindOne(c *gin.Context) {
	id := c.Param("id")
	res, err := h.service.FindOne(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, ErrProductNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Internal server error", nil))
		return
	}
	utils.OK(c, res)
}

func (h *handler) FindOneBySlug(c *gin.Context) {
	slug := c.Param("slug")
	res, err := h.service.FindOneBySlug(c.Request.Context(), slug)
	if err != nil {
		if errors.Is(err, ErrProductNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Internal server error", nil))
		return
	}
	utils.OK(c, res)
}

func (h *handler) Search(c *gin.Context) {
	var query ProductSearchQuery
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

	res, total, err := h.service.Search(c.Request.Context(), query)
	if err != nil {
		c.Error(middleware.NewAppError(500, "Search failed", err))
		return
	}

	meta := utils.NewPaginationMeta(total, int64(query.Page), int64(query.Limit))
	utils.OKWithMeta(c, res, meta)
}

func (h *handler) Create(c *gin.Context) {
	var dto CreateProductDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid request body", nil))
		return
	}

	res, err := h.service.Create(c.Request.Context(), dto)
	if err != nil {
		if errors.Is(err, ErrSlugExists) {
			c.Error(middleware.NewAppError(409, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Internal server error", nil))
		return
	}
	utils.Created(c, res)
}

func (h *handler) Update(c *gin.Context) {
	id := c.Param("id")
	var dto UpdateProductDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid request body", nil))
		return
	}

	res, err := h.service.Update(c.Request.Context(), id, dto)
	if err != nil {
		if errors.Is(err, ErrProductNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		if errors.Is(err, ErrSlugExists) {
			c.Error(middleware.NewAppError(409, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Internal server error", nil))
		return
	}
	utils.OK(c, res)
}

func (h *handler) Delete(c *gin.Context) {
	id := c.Param("id")
	err := h.service.Delete(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, ErrProductNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Internal server error", nil))
		return
	}
	c.Status(204)
}

func (h *handler) ToggleProduct(c *gin.Context) {
	id := c.Param("id")
	shopID, exists := c.Get("shopID")
	if !exists {
		c.Error(middleware.NewAppError(401, "Unauthorized", nil))
		return
	}

	res, err := h.service.ToggleActive(c.Request.Context(), id, shopID.(string))
	if err != nil {
		if errors.Is(err, ErrProductNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to toggle product", err))
		return
	}
	utils.OK(c, res)
}

func (h *handler) BulkUpdate(c *gin.Context) {
	shopID, exists := c.Get("shopID")
	if !exists {
		c.Error(middleware.NewAppError(401, "Unauthorized", nil))
		return
	}

	var dto BulkUpdateProductDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid request body", nil))
		return
	}

	if len(dto.ProductIDs) == 0 {
		c.Error(middleware.NewAppError(400, "productIds is required", nil))
		return
	}

	res, err := h.service.BulkUpdate(c.Request.Context(), dto, shopID.(string))
	if err != nil {
		c.Error(middleware.NewAppError(500, "Bulk update failed", err))
		return
	}

	if len(res.FailedIDs) > 0 {
		utils.PartialSuccess(c, res, len(res.FailedIDs))
		return
	}
	utils.OK(c, res)
}