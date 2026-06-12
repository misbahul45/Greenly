from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ProductIndexItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    id: str
    shop_id: str | None = None
    category_id: str | None = None
    name: str
    slug: str | None = None
    description: str | None = None
    sku: str | None = None
    price: float | None = None
    original_price: float | None = None
    final_price: float | None = None
    currency: str | None = None
    stock: int | None = None
    image_urls: list[str] = Field(default_factory=list)
    rating_average: float | None = None
    review_count: int | None = None
    favorite_count: int | None = None
    
    # Eco Attributes
    eco_score: float | None = None
    eco_label: str | None = None
    material_type: str | None = None
    material_label: str | None = None
    recyclable: bool | None = None
    carbon_footprint: float | None = None
    carbon_label: str | None = None
    eco_badges: list[str] = Field(default_factory=list)
    eco_reasons: list[str] = Field(default_factory=list)
    
    # Promotion
    has_promo: bool = False
    promotion_code: str | None = None
    promotion_label: str | None = None
    discount_percent: float | None = None
    discount_amount: float | None = None
    saving_label: str | None = None
    
    created_at: str | None = None
    updated_at: str | None = None


class SearchFilters(BaseModel):
    category_id: str | None = None
    min_price: float | None = None
    max_price: float | None = None
    min_eco_score: float | None = None


class SearchRequest(BaseModel):
    query: str
    limit: int = Field(default=10, ge=1, le=100)
    filters: SearchFilters | None = None


class SearchResult(BaseModel):
    id: str
    product_id: str
    score: float
    name: str
    slug: str | None = None
    price: float | None = None
    original_price: float | None = None
    final_price: float | None = None
    currency: str | None = None
    image_url: str | None = None
    image_urls: list[str]
    
    # Eco
    eco_score: float | None = None
    eco_label: str | None = None
    material_type: str | None = None
    material_label: str | None = None
    recyclable: bool | None = None
    carbon_footprint: float | None = None
    carbon_label: str | None = None
    eco_badges: list[str] = Field(default_factory=list)
    eco_reasons: list[str] = Field(default_factory=list)
    
    # Promo
    has_promo: bool = False
    promotion_code: str | None = None
    promotion_label: str | None = None
    discount_percent: float | None = None
    discount_amount: float | None = None
    saving_label: str | None = None
    
    rating_average: float | None = None
    review_count: int | None = None
    favorite_count: int | None = None
    reason: str


class EcoScoreRequest(BaseModel):
    product_id: str | None = None
    name: str
    description: str | None = None
    category_id: str | None = None
    material_type: str | None = None
    recyclable: bool | None = None
    carbon_footprint: float | None = None
    packaging: str | None = None


class EcoScoreResponse(BaseModel):
    eco_score: float
    label: str
    reasons: list[str]


class ApiResponse(BaseModel):
    status: str = "success"
    statusCode: int = 200
    path: str
    message: str = "success"
    data: Any = None
    metaData: dict[str, Any] | None = None
