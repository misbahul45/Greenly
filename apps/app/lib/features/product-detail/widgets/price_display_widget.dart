import 'package:Greenly/core/theme/app_theme.dart';
import 'package:Greenly/core/utils/currency_helper.dart';
import 'package:flutter/material.dart';

class PriceDisplayWidget extends StatelessWidget {
  final int price;
  final int? originalPrice;
  final int? discountPercent;
  final String currency;

  const PriceDisplayWidget({
    super.key,
    required this.price,
    this.originalPrice,
    this.discountPercent,
    required this.currency,
  });

  @override
  Widget build(BuildContext context) {
    final hasDiscount = originalPrice != null && originalPrice! > price;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (hasDiscount) ...[
          Row(
            children: [
              Text(
                CurrencyHelper.formatRupiah(originalPrice!),
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[500],
                  decoration: TextDecoration.lineThrough,
                ),
              ),
              if (discountPercent != null && discountPercent! > 0) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.red.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '-$discountPercent%',
                    style: const TextStyle(
                      fontSize: 12,
                      color: Colors.red,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 4),
        ],
        Text(
          CurrencyHelper.formatRupiah(price),
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            color: AppTheme.primaryColor,
          ),
        ),
      ],
    );
  }
}
