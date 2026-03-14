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
	Create(c *gin.Context)
	Update(c *gin.Context)
	Delete(c *gin.Context)
}

type handler struct {
	service Service
}

func NewHandler(service Service) Handler {
	return &handler{
		service: service,
	}
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