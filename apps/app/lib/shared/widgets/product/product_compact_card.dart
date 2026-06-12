import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/shared/widgets/product/product_badges_row.dart';
import 'package:app/shared/widgets/product/product_card_data.dart';
import 'package:app/shared/widgets/product/product_image_box.dart';
import 'package:app/shared/widgets/product/product_price_row.dart';
import 'package:flutter/material.dart';

class ProductCompactCard extends StatelessWidget {
  final ProductCardData data;
  final VoidCallback? onTap;
  final double width;

  const ProductCompactCard({
    super.key,
    required this.data,
    this.onTap,
    this.width = 150,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(UIConstants.radiusM),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(UIConstants.radiusM),
          child: Ink(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(UIConstants.radiusM),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.06),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ProductImageBox(
                  imageUrl: data.imageUrl,
                  height: 110,
                  width: double.infinity,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(UIConstants.radiusM),
                  ),
                  isOutOfStock: data.isOutOfStock,
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(UIConstants.paddingS),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          data.name.isEmpty ? 'Produk' : data.name,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: UIConstants.fontSizeS,
                            height: 1.3,
                            color: Colors.black87,
                          ),
                        ),
                        if (data.semanticReason != null &&
                            data.semanticReason!.isNotEmpty) ...[
                          const SizedBox(height: UIConstants.spacingXS),
                          _ReasonChip(data.semanticReason!),
                        ],
                        if (data.ecoScore != null) ...[
                          const SizedBox(height: UIConstants.spacingXS),
                          ProductBadgesRow(ecoScore: data.ecoScore),
                        ],
                        const Spacer(),
                        ProductPriceRow(price: data.price, compact: true),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ReasonChip extends StatelessWidget {
  final String reason;

  const _ReasonChip(this.reason);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F8E9),
        borderRadius: BorderRadius.circular(UIConstants.radiusS),
      ),
      child: Text(
        reason,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(
          fontSize: UIConstants.fontSizeXS,
          color: AppTheme.primaryColor,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
