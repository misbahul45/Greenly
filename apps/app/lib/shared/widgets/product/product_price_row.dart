import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:Greenly/core/theme/app_theme.dart';
import 'package:Greenly/core/utils/currency_helper.dart';
import 'package:flutter/material.dart';

class ProductPriceRow extends StatelessWidget {
  final int price;
  final int? originalPrice;
  final int? discountPercent;
  final bool compact;

  const ProductPriceRow({
    super.key,
    required this.price,
    this.originalPrice,
    this.discountPercent,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final hasDiscount = originalPrice != null && originalPrice! > price;

    return Wrap(
      spacing: UIConstants.spacingXS,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        Text(
          CurrencyHelper.formatRupiah(price),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.w800,
            fontSize: compact ? UIConstants.fontSizeS : UIConstants.fontSizeM,
          ),
        ),
        if (hasDiscount)
          Text(
            CurrencyHelper.formatRupiah(originalPrice!),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: Colors.grey[500],
              fontSize: UIConstants.fontSizeXS,
              decoration: TextDecoration.lineThrough,
            ),
          ),
      ],
    );
  }
}
