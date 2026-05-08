package productimage

import (
	"catalog-service/middleware"
	"catalog-service/utils"
	"errors"

	"github.com/gin-gonic/gin"
)

type Handler interface {
	GetByProductID(c *gin.Context)
	Upload(c *gin.Context)
	SetPrimary(c *gin.Context)
	Reorder(c *gin.Context)
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
		c.Error(middleware.NewAppError(500, "Failed to fetch images", err))
		return
	}
	utils.OK(c, res)
}

func (h *handler) Upload(c *gin.Context) {
	var dto UploadImageDTO
	if err := c.ShouldBind(&dto); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid request body", nil))
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.Error(middleware.NewAppError(400, "file is required", nil))
		return
	}
	defer file.Close()

	res, err := h.service.Upload(c.Request.Context(), dto, file, header)
	if err != nil {
		if errors.Is(err, ErrUploadFailed) {
			c.Error(middleware.NewAppError(502, "Failed to upload image to storage", nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to save image", err))
		return
	}
	utils.Created(c, res)
}

func (h *handler) SetPrimary(c *gin.Context) {
	productID := c.Param("productId")
	if productID == "" {
		c.Error(middleware.NewAppError(400, "productId is required", nil))
		return
	}

	var dto SetPrimaryDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid request body", nil))
		return
	}

	err := h.service.SetPrimary(c.Request.Context(), productID, dto.ImageID)
	if err != nil {
		if errors.Is(err, ErrImageNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to set primary image", err))
		return
	}
	utils.OK(c, gin.H{"message": "Primary image updated"})
}

func (h *handler) Reorder(c *gin.Context) {
	productID := c.Param("productId")
	if productID == "" {
		c.Error(middleware.NewAppError(400, "productId is required", nil))
		return
	}

	var dto ReorderDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.Error(middleware.NewAppError(400, "Invalid request body", nil))
		return
	}

	err := h.service.Reorder(c.Request.Context(), productID, dto)
	if err != nil {
		c.Error(middleware.NewAppError(500, "Failed to reorder images", err))
		return
	}
	utils.OK(c, gin.H{"message": "Images reordered"})
}

func (h *handler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.Error(middleware.NewAppError(400, "id is required", nil))
		return
	}

	err := h.service.Delete(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, ErrImageNotFound) {
			c.Error(middleware.NewAppError(404, err.Error(), nil))
			return
		}
		c.Error(middleware.NewAppError(500, "Failed to delete image", err))
		return
	}
	c.Status(204)
}
