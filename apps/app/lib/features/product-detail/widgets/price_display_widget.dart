import 'package:app/core/theme/app_theme.dart';
import 'package:app/core/utils/currency_helper.dart';
import 'package:flutter/material.dart';

class PriceDisplayWidget extends StatelessWidget {
  final int price;
  final String currency;

  const PriceDisplayWidget({
    super.key,
    required this.price,
    required this.currency,
  });

  @override
  Widget build(BuildContext context) {
    return Text(
      CurrencyHelper.formatRupiah(price),
      style: const TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        color: AppTheme.primaryColor,
      ),
    );
  }
}
