package review

import (
	"catalog-service/middleware"
	"catalog-service/utils"
	"errors"

	"github.com/gin-gonic/gin"
)

type Handler interface {
	Create(c *gin.Context)
	Update(c *gin.Context)
	Delete(c *gin.Context)
	GetByProduct(c *gin.Context)
	GetByUser(c *gin.Context)
	GetByShop(c *gin.Context)
	GetByID(c *gin.Context)
	MarkHelpful(c *gin.Context)
}

type handler struct {
	service Service
}

func NewHandler(service Service) Handler {
	return &handler{service: service}
}

func (h *handler) Create(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.Error(middleware.NewAppError(401, "Unauthorized", nil))
		return
	}

	var req CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid request body", nil))
		return
	}

	if req.Rating < 1 || req.Rating > 5 {
		c.Error(middleware.NewAppError(400, "Rating must be between 1 and 5", nil))
		return
	}

	res, err := h.service.Create(c.Request.Context(), userID.(string), req)
	if err != nil {
		if errors.Is(err, ErrReviewAlreadyExists) {
			c.Error(middleware.NewAppError(409, err.Error(), nil))
			return
		}
		if errors.Is(err, ErrProductNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to create review", err))
		return
	}
	utils.Created(c, res)
}

func (h *handler) Update(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.Error(middleware.NewAppError(401, "Unauthorized", nil))
		return
	}

	reviewID := c.Param("id")
	if reviewID == "" {
		c.Error(middleware.NewAppError(400, "review id is required", nil))
		return
	}

	var req UpdateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid request body", nil))
		return
	}

	if req.Rating != nil && (*req.Rating < 1 || *req.Rating > 5) {
		c.Error(middleware.NewAppError(400, "Rating must be between 1 and 5", nil))
		return
	}

	res, err := h.service.Update(c.Request.Context(), userID.(string), reviewID, req)
	if err != nil {
		if errors.Is(err, ErrReviewNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		if errors.Is(err, ErrUnauthorized) {
			c.Error(middleware.NewAppError(403, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to update review", err))
		return
	}
	utils.OK(c, res)
}

func (h *handler) Delete(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.Error(middleware.NewAppError(401, "Unauthorized", nil))
		return
	}

	reviewID := c.Param("id")
	if reviewID == "" {
		c.Error(middleware.NewAppError(400, "review id is required", nil))
		return
	}

	err := h.service.Delete(c.Request.Context(), userID.(string), reviewID)
	if err != nil {
		if errors.Is(err, ErrReviewNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		if errors.Is(err, ErrUnauthorized) {
			c.Error(middleware.NewAppError(403, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to delete review", err))
		return
	}
	c.Status(204)
}

func (h *handler) GetByProduct(c *gin.Context) {
	productID := c.Param("productId")
	if productID == "" {
		c.Error(middleware.NewAppError(400, "productId is required", nil))
		return
	}

	var query ReviewQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid query params", nil))
		return
	}

	res, total, err := h.service.GetByProduct(c.Request.Context(), productID, query)
	if err != nil {
		c.Error(middleware.NewAppError(500, "Failed to fetch reviews", err))
		return
	}

	meta := utils.NewPaginationMeta(total, int64(query.Page), int64(query.Limit))
	utils.OKWithMeta(c, res, meta)
}

func (h *handler) GetByUser(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.Error(middleware.NewAppError(401, "Unauthorized", nil))
		return
	}

	var query ReviewQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid query params", nil))
		return
	}

	res, total, err := h.service.GetByUser(c.Request.Context(), userID.(string), query)
	if err != nil {
		c.Error(middleware.NewAppError(500, "Failed to fetch reviews", err))
		return
	}

	meta := utils.NewPaginationMeta(total, int64(query.Page), int64(query.Limit))
	utils.OKWithMeta(c, res, meta)
}

func (h *handler) GetByShop(c *gin.Context) {
	shopID, exists := c.Get("shopID")
	if !exists {
		c.Error(middleware.NewAppError(401, "Unauthorized", nil))
		return
	}

	var query ReviewQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid query params", nil))
		return
	}

	res, total, err := h.service.GetByShop(c.Request.Context(), shopID.(string), query)
	if err != nil {
		c.Error(middleware.NewAppError(500, "Failed to fetch reviews", err))
		return
	}

	meta := utils.NewPaginationMeta(total, int64(query.Page), int64(query.Limit))
	utils.OKWithMeta(c, res, meta)
}

func (h *handler) GetByID(c *gin.Context) {
	reviewID := c.Param("id")
	if reviewID == "" {
		c.Error(middleware.NewAppError(400, "review id is required", nil))
		return
	}

	res, err := h.service.GetByID(c.Request.Context(), reviewID)
	if err != nil {
		if errors.Is(err, ErrReviewNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to fetch review", err))
		return
	}
	utils.OK(c, res)
}

func (h *handler) MarkHelpful(c *gin.Context) {
	reviewID := c.Param("id")
	if reviewID == "" {
		c.Error(middleware.NewAppError(400, "review id is required", nil))
		return
	}

	err := h.service.MarkHelpful(c.Request.Context(), reviewID)
	if err != nil {
		if errors.Is(err, ErrReviewNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to mark helpful", err))
		return
	}
	utils.OK(c, gin.H{"message": "Marked as helpful"})
}