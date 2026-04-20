package category

import (
	"catalog-service/databases"
	"catalog-service/middleware"
	"catalog-service/utils"
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler interface {
	FindMany(c *gin.Context)
	FindOne(c *gin.Context)
	Create(c *gin.Context)
	Update(c *gin.Context)
	Delete(c *gin.Context)
	FindCategoryTree(c *gin.Context)
}

type handler struct {
	service Service
}

func NewHandler(service Service) Handler {
	return &handler{service: service}
}

func (h *handler) FindMany(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	search := c.Query("search")
	sortBy := c.Query("sortBy")
	sortOrder := c.Query("sortOrder")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page <= 0 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	query := CategoryQuery{
		Page:      page,
		Limit:     limit,
		Search:    search,
		SortBy:    sortBy,
		SortOrder: sortOrder,
	}

	res, total, err := h.service.FindMany(c.Request.Context(), query)
	if err != nil {
		c.Error(middleware.NewAppError(500, "Failed to fetch categories", nil))
		return
	}

	if res == nil {
		res = []databases.Category{}
	}

	meta := utils.NewPaginationMeta(total, int64(page), int64(limit))
	utils.OKWithMeta(c, res, meta)
}

func (h *handler) FindOne(c *gin.Context) {
	id := c.Param("id")

	res, err := h.service.FindOne(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, ErrCategoryNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Internal server error", nil))
		return
	}

	utils.OK(c, res)
}

func (h *handler) Create(c *gin.Context) {
	var dto CreateCategoryDTO

	if err := c.ShouldBindJSON(&dto); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid request body", nil))
		return
	}

	res, err := h.service.Create(c.Request.Context(), dto)
	if err != nil {
		if errors.Is(err, ErrCategoryNotFound) {
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

	utils.Created(c, res)
}

func (h *handler) Update(c *gin.Context) {
	id := c.Param("id")

	var dto UpdateCategoryDTO

	if err := c.ShouldBindJSON(&dto); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid request body", nil))
		return
	}

	res, err := h.service.Update(c.Request.Context(), id, dto)
	if err != nil {
		if errors.Is(err, ErrCategoryNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
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
		if errors.Is(err, ErrCategoryNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Internal server error", nil))
		return
	}

	c.Status(204)
}

func (h *handler) FindCategoryTree(c *gin.Context) {
	query := CategoryTreeQuery{
		OnlyActive: true,
		Format:     "nested",
	}

	if err := c.ShouldBindQuery(&query); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid query parameters", err))
		return
	}

	if query.Format != "nested" && query.Format != "flat" {
		query.Format = "nested"
	}

	res, err := h.service.FindCategoryTree(c.Request.Context(), query)
	if err != nil {
		c.Error(middleware.NewAppError(500, "Failed to fetch category tree", err))
		return
	}

	if res.Data == nil {
		res.Data = []CategoryTreeNode{}
	}

	utils.OK(c, res.Data)
}