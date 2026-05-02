import 'package:app/core/constants/ui_constants.dart';
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
          color: AppTheme.backgroundColor,
          borderRadius: BorderRadius.circular(UIConstants.radiusM),
          boxShadow: [
            BoxShadow(
              blurRadius: UIConstants.spacingM,
              color: AppTheme.primaryColor.withOpacity(0.08),
              offset: const Offset(0, UIConstants.paddingXS),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
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
            Padding(
              padding: const EdgeInsets.fromLTRB(
                UIConstants.paddingS,
                UIConstants.paddingXS,
                UIConstants.paddingS,
                UIConstants.paddingS,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: UIConstants.fontSizeS,
                      height: 1.3,
                      color: Color(0xFF1A1A2E),
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingXS),
                  if (product.description.isNotEmpty)
                    Text(
                      product.description,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: UIConstants.fontSizeXS,
                        color: Colors.grey.shade500,
                        height: 1.3,
                      ),
                    ),
                  const SizedBox(height: UIConstants.paddingXS),
                  ProductStatsRow(
                    ratingAverage: product.ratingAverage,
                    reviewCount: product.reviewCount,
                    favoriteCount: product.favoriteCount,
                  ),
                  const SizedBox(height: UIConstants.spacingS),
                  if (isOutOfStock)
                    const ProductStockBadge(
                      label: 'Habis',
                      color: Color(0xFF9E9E9E),
                    )
                  else if (isLowStock)
                    ProductStockBadge(
                      label: 'Sisa ${product.stock}',
                      color: Color(0xFFFF7043),
                    ),
                  if (isOutOfStock || isLowStock)
                    const SizedBox(height: UIConstants.paddingXS),
                  Text(
                    CurrencyHelper.formatRupiah(product.price),
                    style: const TextStyle(
                      color: AppTheme.primaryColor,
                      fontWeight: FontWeight.w800,
                      fontSize: UIConstants.fontSizeM,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}