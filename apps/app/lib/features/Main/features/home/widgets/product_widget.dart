// product_card.dart
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/utils/currency_helper.dart';
import 'package:app/features/Main/features/home/model/data/product_data.dart';
import 'package:app/features/Main/features/home/model/data/promotion_data.dart';
import 'package:app/features/Main/features/home/widgets/product_image_section.dart';
import 'package:app/features/Main/features/home/widgets/product_stats_row.dart';
import 'package:app/features/Main/features/home/widgets/product_stock_badge.dart';
import 'package:flutter/material.dart';
import 'package:app/core/theme/app_theme.dart';

class ProductWidget extends StatelessWidget {
  final ProductData product;
  final PromotionData? promotion;

  const ProductWidget({
    super.key,
    required this.product,
    this.promotion,
  });

  @override
  Widget build(BuildContext context) {
    final isLowStock = product.stock > 0 && product.stock <= 5;
    final isOutOfStock = product.stock == 0;

    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(
          context,
          AppRoutes.productDetail,
          arguments: product.slug,
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              blurRadius: 12,
              color: Colors.black.withOpacity(0.07),
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ProductImageSection(
              image: product.imageUrls.isNotEmpty
                  ? product.imageUrls.first
                  : '',
              hasPromo: promotion != null,
              promotion: promotion,
              categoryName: product.categoryName,
              isOutOfStock: isOutOfStock,
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10, 7, 10, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                        height: 1.3,
                        color: Color(0xFF1A1A2E),
                      ),
                    ),
                    const SizedBox(height: 3),
                    if (product.description.isNotEmpty)
                      Text(
                        product.description,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.grey.shade500,
                          height: 1.3,
                        ),
                      ),
                    const SizedBox(height: 4),
                    ProductStatsRow(
                      ratingAverage: product.ratingAverage,
                      reviewCount: product.reviewCount,
                      favoriteCount: product.favoriteCount,
                    ),
                    const Spacer(),
                    if (isOutOfStock)
                      const ProductStockBadge(
                        label: 'Habis',
                        color: Color(0xFF9E9E9E),
                      )
                    else if (isLowStock)
                      ProductStockBadge(
                        label: 'Sisa ${product.stock}',
                        color: const Color(0xFFFF7043),
                      ),
                    if (isOutOfStock || isLowStock) const SizedBox(height: 4),
                    Text(
                      CurrencyHelper.formatRupiah(product.price),
                      style: TextStyle(
                        color: AppTheme.primaryColor,
                        fontWeight: FontWeight.w800,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}