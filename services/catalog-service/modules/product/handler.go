package product

import (
	"catalog-service/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProductHandler interface {
	FindManyProducts(c *gin.Context)
	FindOneProduct(c *gin.Context)
	CreateProduct(c *gin.Context)
	UpdateProduct(c *gin.Context)
	DeleteProduct(c *gin.Context)
}

type productHandler struct {
	service ProductService
}

func NewProductHandler(service ProductService) ProductHandler {
	return &productHandler{service: service}
}

func (h *productHandler) FindManyProducts(c *gin.Context) {

	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")
	search := c.Query("search")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page <= 0 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	if limit > 100 {
		limit = 100
	}

	query := ProductQuery{
		Page:   page,
		Limit:  limit,
		Search: search,
	}

	res, total, err := h.service.FindMany(query)
	if err != nil {
		utils.InternalError(c, "failed to fetch products")
		return
	}

	meta := utils.NewPaginationMeta(total, int64(page), int64(limit))

	utils.OKWithMeta(c, res.Items, meta)
}

func (h *productHandler) FindOneProduct(c *gin.Context) {

	id := c.Param("id")

	res, err := h.service.FindOne(id)
	if err != nil {
		utils.NotFound(c, "product not found")
		return
	}

	utils.OK(c, res)
}

func (h *productHandler) CreateProduct(c *gin.Context) {

	var dto CreateProductDTO

	if err := c.ShouldBindJSON(&dto); err != nil {
		utils.BadRequest(c, "invalid request")
		return
	}

	res, err := h.service.Create(dto)
	if err != nil {
		utils.InternalError(c, "failed to create product")
		return
	}

	utils.Created(c, res)
}

func (h *productHandler) UpdateProduct(c *gin.Context) {

	id := c.Param("id")

	var dto UpdateProductDTO

	if err := c.ShouldBindJSON(&dto); err != nil {
		utils.BadRequest(c, "invalid request")
		return
	}

	res, err := h.service.Update(id, dto)
	if err != nil {
		utils.InternalError(c, "failed to update product")
		return
	}

	utils.OK(c, res)
}

func (h *productHandler) DeleteProduct(c *gin.Context) {

	id := c.Param("id")

	if err := h.service.Delete(id); err != nil {
		utils.InternalError(c, "failed to delete product")
		return
	}

	utils.OK(c, "deleted")
}