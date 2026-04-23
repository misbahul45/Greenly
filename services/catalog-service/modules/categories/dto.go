package category

import "time"

type CreateCategoryDTO struct {
	Name     string  `json:"name" binding:"required"`
	Slug     string  `json:"slug"`
	ParentID *string `json:"parentId"`
}

type UpdateCategoryDTO struct {
	Name     *string `json:"name"`
	Slug     *string `json:"slug"`
	ParentId *string `json:"parentId"`
}

type CategoryQuery struct {
	Page   int    `form:"page"`
	Limit  int    `form:"limit"`
	Search string `form:"search"`

	SortBy    string `form:"sortBy"`
	SortOrder string `form:"sortOrder"`
}

type CategoryTreeQuery struct {
	MaxDepth        *int   `form:"max_depth"`
	ParentID        string `form:"parent_id"`
	IncludeProducts bool   `form:"include_products"`
	OnlyActive      bool   `form:"only_active"`
	WithPath        bool   `form:"with_path"`
	Format          string `form:"format"`
}

type CategoryTreeNode struct {
	ID           string             `json:"id"`
	Name         string             `json:"name"`
	Slug         string             `json:"slug"`
	ParentID     *string            `json:"parentId,omitempty"`
	ProductCount int                `json:"productCount,omitempty"`
	Level        int                `json:"level"`
	Path         []string           `json:"path,omitempty"`
	Children     []CategoryTreeNode `json:"children,omitempty"`
	CreatedAt    time.Time          `json:"createdAt"`
	UpdatedAt    time.Time          `json:"updatedAt"`
}

type CategoryTreeResponse struct {
	Data []CategoryTreeNode `json:"data"`
	Meta TreeMeta           `json:"meta"`
}

type TreeMeta struct {
	TotalCategories int64  `json:"totalCategories"`
	MaxDepthReached *int   `json:"maxDepthReached,omitempty"`
	RootID          string `json:"rootId"`
	Format          string `json:"format"`
}