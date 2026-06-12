import 'package:app/core/router/app_routes.dart';
import 'package:app/features/ml-products/domain/ml_product_result.dart';
import 'package:app/shared/widgets/product/product_card_data.dart';
import 'package:app/shared/widgets/product/product_compact_card.dart';
import 'package:flutter/material.dart';

class MlProductCard extends StatelessWidget {
  final MlProductResult product;

  const MlProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return ProductCompactCard(
      data: ProductCardData(
        productId: product.productId,
        slug: product.slug,
        name: product.name,
        imageUrl:
            product.imageUrl ??
            (product.imageUrls.isNotEmpty ? product.imageUrls.first : null),
        price: product.price?.round() ?? 0,
        ecoScore: product.ecoScore,
        rating: product.ratingAverage,
        reviewCount: product.reviewCount,
        favoriteCount: product.favoriteCount,
        stock: product.stock,
        categoryName: product.categoryName,
        shopName: product.shopName,
        semanticReason: product.reason,
        variant: ProductCardVariant.compact,
      ),
      onTap: product.slug?.isNotEmpty == true
          ? () => Navigator.pushNamed(
              context,
              AppRoutes.productDetail,
              arguments: product.slug,
            )
          : null,
    );
  }
}
