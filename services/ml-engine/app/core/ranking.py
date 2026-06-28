from app.schemas import ProductIndexItem, SearchResult


def rank_home_products(products: list[ProductIndexItem], limit: int) -> list[SearchResult]:
    ranked = sorted(products, key=home_score, reverse=True)
    return [to_result(product, home_score(product)) for product in ranked[:limit]]


def rank_personalized_home_products(
    products: list[ProductIndexItem], 
    similarities: dict[str, float], 
    limit: int
) -> list[SearchResult]:
    # Pre-compute scores to avoid O(N*log(N)) duplicate calculation
    blend_scores: dict[str, float] = {}
    
    for product in products:
        sim = max(similarities.get(product.id, 0.0), 0.0)
        base = home_score(product)
        blend_scores[product.id] = 0.40 * sim + 0.60 * base
        
    ranked = sorted(products, key=lambda p: blend_scores[p.id], reverse=True)
    
    results = []
    for product in ranked[:limit]:
        score = blend_scores[product.id]
        result = to_result(product, score)
        result.reason = "Berdasarkan riwayat dan preferensi Anda" if similarities.get(product.id, 0.0) > 0.4 else result.reason
        results.append(result)
    return results


def rank_eco_products(products: list[ProductIndexItem], limit: int) -> list[SearchResult]:
    # Sort strictly by eco_score, then rating_average
    ranked = sorted(
        products,
        key=lambda p: (p.eco_score or 0, p.rating_average or 0),
        reverse=True,
    )
    return [to_result(product, (product.eco_score or 0) / 100) for product in ranked[:limit]]


def home_score(product: ProductIndexItem) -> float:
    eco = (product.eco_score or 0) / 100
    rating = (product.rating_average or 0) / 5
    favorites = min((product.favorite_count or 0) / 100, 1)
    stock = 1 if (product.stock or 0) > 0 else 0
    price_score = 1 if product.price and product.price > 0 else 0
    generic = 0.5
    return (
        0.35 * generic
        + 0.20 * eco
        + 0.15 * rating
        + 0.10 * favorites
        + 0.10 * stock
        + 0.10 * price_score
    )


def to_result(product: ProductIndexItem, score: float) -> SearchResult:
    image_url = product.image_urls[0] if product.image_urls else None
    reason = "Rekomendasi berdasarkan skor eco, rating, favorit, dan stok"
    if product.eco_score and product.eco_score >= 80:
        reason = f"Produk pilihan dengan Skor Eco {int(product.eco_score)}"

    return SearchResult(
        id=product.id,
        product_id=product.id,
        score=score,
        name=product.name,
        slug=product.slug,
        price=product.price,
        original_price=product.original_price,
        final_price=product.final_price,
        currency=product.currency,
        image_url=image_url,
        image_urls=product.image_urls,
        
        # Eco
        eco_score=product.eco_score,
        eco_label=product.eco_label,
        material_type=product.material_type,
        material_label=product.material_label,
        recyclable=product.recyclable,
        carbon_footprint=product.carbon_footprint,
        carbon_label=product.carbon_label,
        eco_badges=product.eco_badges,
        eco_reasons=product.eco_reasons,
        
        # Promo
        has_promo=product.has_promo,
        promotion_code=product.promotion_code,
        promotion_label=product.promotion_label,
        discount_percent=product.discount_percent,
        discount_amount=product.discount_amount,
        saving_label=product.saving_label,
        
        rating_average=product.rating_average,
        review_count=product.review_count,
        favorite_count=product.favorite_count,
        reason=reason,
    )
