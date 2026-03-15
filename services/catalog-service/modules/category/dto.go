package category

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