import 'package:app/core/constants/ui_constants.dart';
import 'package:app/shared/widgets/product/product_badges_row.dart';
import 'package:app/shared/widgets/product/product_card_data.dart';
import 'package:app/shared/widgets/product/product_price_row.dart';
import 'package:flutter/material.dart';

class ProductHorizontalInfo extends StatelessWidget {
  final ProductCardData data;
  final bool showShopName;
  final bool showRating;
  final bool showStock;
  final bool showEcoBadge;
  final bool compact;

  const ProductHorizontalInfo({
    super.key,
    required this.data,
    this.showShopName = false,
    this.showRating = true,
    this.showStock = false,
    this.showEcoBadge = true,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          data.name.isEmpty ? 'Produk' : data.name,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: compact ? UIConstants.fontSizeS : UIConstants.fontSizeM,
            height: 1.3,
            color: Colors.black87,
          ),
        ),
        if (data.semanticReason != null && data.semanticReason!.isNotEmpty) ...[
          const SizedBox(height: UIConstants.spacingXS),
          _ReasonLine(data.semanticReason!),
        ],
        if (showShopName &&
            data.shopName != null &&
            data.shopName!.isNotEmpty) ...[
          const SizedBox(height: UIConstants.spacingXS),
          Text(
            data.shopName!,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: UIConstants.fontSizeXS,
              color: Colors.grey[500],
            ),
          ),
        ],
        if (showRating && data.rating != null && data.rating! > 0) ...[
          const SizedBox(height: UIConstants.spacingXS),
          _RatingLine(data: data),
        ],
        const SizedBox(height: UIConstants.spacingS),
        ProductPriceRow(
          price: data.price,
          originalPrice: data.originalPrice,
          discountPercent: data.discountPercent,
          compact: compact,
        ),
        const SizedBox(height: UIConstants.spacingXS),
        ProductBadgesRow(
          ecoScore: data.ecoScore,
          stock: data.stock,
          showEcoBadge: showEcoBadge,
          showStock: showStock,
          compact: true,
        ),
      ],
    );
  }
}

class _ReasonLine extends StatelessWidget {
  final String reason;

  const _ReasonLine(this.reason);

  @override
  Widget build(BuildContext context) {
    return Text(
      reason,
      maxLines: 2,
      overflow: TextOverflow.ellipsis,
      style: TextStyle(
        fontSize: UIConstants.fontSizeXS,
        color: Colors.grey[600],
        height: 1.35,
      ),
    );
  }
}

class _RatingLine extends StatelessWidget {
  final ProductCardData data;

  const _RatingLine({required this.data});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.star_rounded, size: 13, color: Color(0xFFFFC107)),
        const SizedBox(width: 2),
        Text(
          data.rating!.toStringAsFixed(1),
          style: TextStyle(
            fontSize: UIConstants.fontSizeXS,
            color: Colors.grey[600],
            fontWeight: FontWeight.w700,
          ),
        ),
        if (data.reviewCount != null) ...[
          const SizedBox(width: 2),
          Text(
            '(${data.reviewCount})',
            style: TextStyle(
              fontSize: UIConstants.fontSizeXS,
              color: Colors.grey[500],
            ),
          ),
        ],
      ],
    );
  }
}
