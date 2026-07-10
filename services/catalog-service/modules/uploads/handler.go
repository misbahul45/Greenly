package uploads

import (
	"catalog-service/internal/imagekit"
	"catalog-service/middleware"
	"catalog-service/utils"
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

const maxAvatarSize = 5 * 1024 * 1024

var allowedMIMETypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/webp": true,
}

type Handler interface {
	UploadAvatar(c *gin.Context)
}

type handler struct {
	imagekit imagekit.Client
}

func NewHandler(imagekitClient imagekit.Client) Handler {
	return &handler{imagekit: imagekitClient}
}

func (h *handler) UploadAvatar(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.Error(middleware.NewAppError(400, "file is required", nil))
		return
	}
	defer file.Close()

	if header.Size > maxAvatarSize {
		c.Error(middleware.NewAppError(400, "file size exceeds 5MB limit", nil))
		return
	}

	fileData, err := io.ReadAll(file)
	if err != nil {
		c.Error(middleware.NewAppError(400, "Failed to read file", nil))
		return
	}

	detectedType := http.DetectContentType(fileData)
	if !allowedMIMETypes[detectedType] {
		c.Error(middleware.NewAppError(400, "only JPEG, PNG, and WebP images are allowed", nil))
		return
	}

	userID, exists := c.Get("user_id")
	folder := "/avatars"
	if exists && userID != nil {
		folder = fmt.Sprintf("/avatars/%s", userID)
	}

	uploaded, err := h.imagekit.Upload(header.Filename, fileData, folder)
	if err != nil {
		c.Error(middleware.NewAppError(502, "Failed to upload image to storage", nil))
		return
	}

	utils.Created(c, gin.H{
		"url":    uploaded.URL,
		"fileId": uploaded.FileID,
	})
}
