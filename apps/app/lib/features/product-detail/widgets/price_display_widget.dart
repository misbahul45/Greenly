import 'package:app/core/theme/app_theme.dart';
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
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          'Rp ${price.toStringAsFixed(0)}',
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Color(0xFF2E7D32),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          currency,
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }
}