package productimage

import (
	"catalog-service/internal/imagekit"
	"context"
	"errors"
	"fmt"
	"mime/multipart"
)

var (
	ErrImageNotFound = errors.New("image not found")
	ErrUploadFailed  = errors.New("failed to upload image")
)

type Service interface {
	GetByProductID(ctx context.Context, productID string) ([]ProductImageResponse, error)
	Upload(ctx context.Context, dto UploadImageDTO, file multipart.File, header *multipart.FileHeader) (ProductImageResponse, error)
	SetPrimary(ctx context.Context, productID string, imageID string) error
	Reorder(ctx context.Context, productID string, dto ReorderDTO) error
	Delete(ctx context.Context, id string) error
}

type service struct {
	repository Repository
	imagekit   imagekit.Client
}

func NewService(repository Repository, imagekitClient imagekit.Client) Service {
	return &service{
		repository: repository,
		imagekit:   imagekitClient,
	}
}

func (s *service) GetByProductID(ctx context.Context, productID string) ([]ProductImageResponse, error) {
	images, err := s.repository.FindByProductID(ctx, productID)
	if err != nil {
		return nil, err
	}

	responses := make([]ProductImageResponse, len(images))
	for i, img := range images {
		responses[i] = ToResponse(&img)
	}
	return responses, nil
}

func (s *service) Upload(ctx context.Context, dto UploadImageDTO, file multipart.File, header *multipart.FileHeader) (ProductImageResponse, error) {
	fileData := make([]byte, header.Size)
	if _, err := file.Read(fileData); err != nil {
		return ProductImageResponse{}, ErrUploadFailed
	}

	folder := fmt.Sprintf("/products/%s", dto.ProductID)
	uploaded, err := s.imagekit.Upload(header.Filename, fileData, folder)
	if err != nil {
		return ProductImageResponse{}, ErrUploadFailed
	}

	img := ProductImage{
		ProductID: dto.ProductID,
		URL:       uploaded.URL,
		FileID:    uploaded.FileID,
		IsPrimary: dto.IsPrimary,
		Order:     dto.Order,
	}

	created, err := s.repository.Create(ctx, img)
	if err != nil {
		s.imagekit.Delete(uploaded.FileID)
		return ProductImageResponse{}, err
	}

	if dto.IsPrimary {
		s.repository.SetPrimary(ctx, dto.ProductID, created.ID)
	}

	return ToResponse(&created), nil
}

func (s *service) SetPrimary(ctx context.Context, productID string, imageID string) error {
	img, err := s.repository.FindByID(ctx, imageID)
	if err != nil {
		return ErrImageNotFound
	}
	if img.ProductID != productID {
		return ErrImageNotFound
	}
	return s.repository.SetPrimary(ctx, productID, imageID)
}

func (s *service) Reorder(ctx context.Context, productID string, dto ReorderDTO) error {
	for _, item := range dto.Orders {
		img, err := s.repository.FindByID(ctx, item.ImageID)
		if err != nil || img.ProductID != productID {
			continue
		}
		s.repository.UpdateOrder(ctx, item.ImageID, item.Order)
	}
	return nil
}

func (s *service) Delete(ctx context.Context, id string) error {
	img, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return ErrImageNotFound
	}

	if img.FileID != "" {
		s.imagekit.Delete(img.FileID)
	}

	return s.repository.Delete(ctx, id)
}
