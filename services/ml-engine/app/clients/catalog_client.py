import httpx

from app.config import get_settings
from app.schemas import ProductIndexItem


class CatalogClient:
    def __init__(self, base_url: str | None = None):
        self.base_url = (base_url or get_settings().catalog_service_url).rstrip("/")

    async def fetch_products(self, page_size: int = 100) -> list[ProductIndexItem]:
        page = 1
        products: list[ProductIndexItem] = []

        async with httpx.AsyncClient(base_url=self.base_url, timeout=30) as client:
            while True:
                response = await client.get("/products", params={"page": page, "limit": page_size, "is_active": "true"})
                response.raise_for_status()
                payload = response.json()
                items = _extract_items(payload)
                meta = payload.get("metaData") or payload.get("meta") or {}

                products.extend(normalize_product(item) for item in items if isinstance(item, dict) and _get_id(item))

                total = int(meta.get("total", len(products)) or len(products))
                last_page = int(meta.get("lastPage", page) or page)
                if page >= last_page or len(products) >= total or not items:
                    break
                page += 1

        return products

    async def fetch_product(self, product_id: str) -> ProductIndexItem | None:
        async with httpx.AsyncClient(base_url=self.base_url, timeout=30) as client:
            response = await client.get(f"/products/{product_id}")
            if response.status_code == 404:
                return None
            response.raise_for_status()
            payload = response.json()
            item = payload.get("data") if isinstance(payload, dict) else None
            if isinstance(item, dict) and isinstance(item.get("product"), dict):
                item = item["product"]
            if not isinstance(item, dict) or not _get_id(item):
                return None
            return normalize_product(item)


def _extract_items(payload: dict) -> list[dict]:
    data = payload.get("data", []) if isinstance(payload, dict) else []
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for key in ("items", "products", "rows", "result", "results"):
            value = data.get(key)
            if isinstance(value, list):
                return value
    return []


def _get_id(item: dict) -> str | None:
    return item.get("id") or item.get("_id") or item.get("productId") or item.get("product_id")


def _to_float(value) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _to_int(value) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _image_urls(item: dict) -> list[str]:
    images = item.get("imageUrls") or item.get("image_urls") or item.get("images") or []
    if isinstance(images, list):
        urls: list[str] = []
        for image in images:
            if isinstance(image, str):
                urls.append(image)
            elif isinstance(image, dict):
                url = image.get("url") or image.get("imageUrl") or image.get("image_url")
                if url:
                    urls.append(str(url))
        return urls
    return []


def normalize_product(item: dict) -> ProductIndexItem:
    eco = item.get("eco") or item.get("ecoAttribute") or item.get("eco_attribute") or {}
    promo = item.get("promotion") or item.get("promotion_info") or {}
    rating = item.get("rating") or item.get("productRating") or item.get("product_rating") or {}
    
    return ProductIndexItem(
        id=str(_get_id(item)),
        shop_id=item.get("shopId") or item.get("shop_id"),
        category_id=item.get("categoryId") or item.get("category_id"),
        name=item.get("name") or "",
        slug=item.get("slug"),
        description=item.get("description"),
        sku=item.get("sku"),
        price=_to_float(item.get("price") or item.get("finalPrice") or item.get("final_price")),
        original_price=_to_float(item.get("originalPrice") or item.get("original_price") or item.get("price")),
        final_price=_to_float(item.get("finalPrice") or item.get("final_price") or item.get("price")),
        currency=item.get("currency"),
        stock=_to_int(item.get("stock")),
        image_urls=_image_urls(item),
        rating_average=_to_float(item.get("ratingAverage") or item.get("rating_average") or rating.get("average")),
        review_count=_to_int(item.get("reviewCount") or item.get("review_count") or rating.get("reviewCount")),
        favorite_count=_to_int(item.get("favoriteCount") or item.get("favorite_count")),
        
        # Eco Attributes
        eco_score=_to_float(item.get("ecoScore") or item.get("eco_score") or eco.get("score") or eco.get("ecoScore")),
        eco_label=eco.get("label") or eco.get("ecoLabel"),
        material_type=item.get("materialType") or item.get("material_type") or eco.get("materialType") or eco.get("material_type"),
        material_label=eco.get("materialLabel") or eco.get("material_label"),
        recyclable=item.get("recyclable") if item.get("recyclable") is not None else eco.get("recyclable"),
        carbon_footprint=_to_float(item.get("carbonFootprint") or item.get("carbon_footprint") or eco.get("carbonFootprint") or eco.get("carbon_footprint") or eco.get("carbonFootprint")),
        carbon_label=eco.get("carbonLabel") or eco.get("carbon_label"),
        eco_badges=eco.get("badges") or eco.get("eco_badges") or [],
        eco_reasons=eco.get("reasons") or eco.get("eco_reasons") or [],
        
        # Promotion
        has_promo=promo.get("hasPromo") or promo.get("has_promo") or False,
        promotion_code=promo.get("code") or promo.get("promotion_code"),
        promotion_label=promo.get("label") or promo.get("promotion_label"),
        discount_percent=_to_float(promo.get("discountPercent") or promo.get("discount_percent")),
        discount_amount=_to_float(promo.get("discountAmount") or promo.get("discount_amount")),
        saving_label=promo.get("savingLabel") or promo.get("saving_label"),
        
        created_at=item.get("createdAt") or item.get("created_at"),
        updated_at=item.get("updatedAt") or item.get("updated_at"),
    )
