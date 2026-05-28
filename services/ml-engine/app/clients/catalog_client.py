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
                items = payload.get("data", [])
                meta = payload.get("metaData") or payload.get("meta") or {}

                products.extend(normalize_product(item) for item in items if item.get("id"))

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
            if not isinstance(item, dict) or not item.get("id"):
                return None
            return normalize_product(item)


def normalize_product(item: dict) -> ProductIndexItem:
    return ProductIndexItem(
        id=str(item.get("id")),
        shop_id=item.get("shopId") or item.get("shop_id"),
        category_id=item.get("categoryId") or item.get("category_id"),
        name=item.get("name") or "",
        slug=item.get("slug"),
        description=item.get("description"),
        sku=item.get("sku"),
        price=item.get("price"),
        currency=item.get("currency"),
        stock=item.get("stock"),
        image_urls=item.get("imageUrls") or item.get("image_urls") or [],
        rating_average=item.get("ratingAverage") or item.get("rating_average"),
        review_count=item.get("reviewCount") or item.get("review_count"),
        favorite_count=item.get("favoriteCount") or item.get("favorite_count"),
        eco_score=item.get("ecoScore") or item.get("eco_score"),
        material_type=item.get("materialType") or item.get("material_type"),
        recyclable=item.get("recyclable"),
        carbon_footprint=item.get("carbonFootprint") or item.get("carbon_footprint"),
        created_at=item.get("createdAt") or item.get("created_at"),
        updated_at=item.get("updatedAt") or item.get("updated_at"),
    )
