import 'package:Greenly/features/search-product/domain/data/search_product_result.dart';
import 'package:Greenly/shared/widgets/product/product_card_data.dart';
import 'package:Greenly/shared/widgets/product/product_horizontal_card.dart';
import 'package:flutter/material.dart';

class SearchResultCard extends StatelessWidget {
  final SearchProductResult result;
  final VoidCallback? onTap;

  const SearchResultCard({super.key, required this.result, this.onTap});

  @override
  Widget build(BuildContext context) {
    return ProductHorizontalCard(
      data: ProductCardData(
        productId: result.id,
        slug: result.slug,
        name: result.name,
        imageUrl: result.imageUrl,
        price: result.price?.round() ?? 0,
        ecoScore: result.ecoScore,
        semanticReason: result.reason,
        fromFallback: result.fromFallback,
        rating: result.rating,
        reviewCount: result.reviewCount,
        favoriteCount: result.favoriteCount,
        stock: result.stock,
        categoryName: result.categoryName,
        shopName: result.shopName,
        isFavorite: result.isFavorite,
        variant: ProductCardVariant.horizontal,
      ),
      onTap: onTap,
      imageSize: 72,
      showEcoBadge: true,
    );
  }
}
