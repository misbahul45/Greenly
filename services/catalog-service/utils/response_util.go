package utils

import (
	"math"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type PaginationMeta struct {
	Total    int64 `json:"total"`
	Page     int64 `json:"page"`
	Limit    int64 `json:"limit"`
	LastPage int64 `json:"lastPage"`
}

type Response struct {
	Status     string          `json:"status"`
	StatusCode int             `json:"statusCode"`
	Path       string          `json:"path"`
	Message    string          `json:"message"`
	Data       interface{}     `json:"data,omitempty"`
	MetaData       *PaginationMeta `json:"metaData,omitempty"`
	Timestamp  string          `json:"timestamp"`
}

func NewPaginationMeta(total, page, limit int64) *PaginationMeta {
	var lastPage int64 = 1

	if limit > 0 {
		lastPage = int64(math.Ceil(float64(total) / float64(limit)))
	}

	return &PaginationMeta{
		Total:    total,
		Page:     page,
		Limit:    limit,
		LastPage: lastPage,
	}
}

func Success(c *gin.Context, statusCode int, message string, data interface{}, metaData *PaginationMeta) {

	if message == "" {
		message = "success"
	}

	res := Response{
		Status:     "success",
		StatusCode: statusCode,
		Path:       c.Request.URL.Path,
		Message:    message,
		Data:       data,
		MetaData:   metaData,
		Timestamp:  time.Now().UTC().Format(time.RFC3339),
	}

	c.JSON(statusCode, res)
}

func Error(c *gin.Context, statusCode int, message string, data interface{}) {

	if message == "" {
		message = "error"
	}

	res := Response{
		Status:     "error",
		StatusCode: statusCode,
		Path:       c.Request.URL.Path,
		Message:    message,
		Data:       data,
		Timestamp:  time.Now().UTC().Format(time.RFC3339),
	}

	c.AbortWithStatusJSON(statusCode, res)
}

func OK(c *gin.Context, data interface{}) {
	Success(c, http.StatusOK, "success", data, nil)
}

func OKWithMeta(c *gin.Context, data interface{}, meta *PaginationMeta) {
	Success(c, http.StatusOK, "success", data, meta)
}

func Created(c *gin.Context, data interface{}) {
	Success(c, http.StatusCreated, "created", data, nil)
}

func BadRequest(c *gin.Context, message string) {
	Error(c, http.StatusBadRequest, message, nil)
}

func NotFound(c *gin.Context, message string) {
	Error(c, http.StatusNotFound, message, nil)
}

func InternalError(c *gin.Context, message string) {
	Error(c, http.StatusInternalServerError, message, nil)
}