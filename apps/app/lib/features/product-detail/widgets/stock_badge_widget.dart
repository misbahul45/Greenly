import 'package:app/core/theme/app_theme.dart';
import 'package:flutter/material.dart';

class StockBadgeWidget extends StatelessWidget {
  final int stock;

  const StockBadgeWidget({
    super.key,
    required this.stock,
  });

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color textColor;
    String text;

    if (stock <= 0) {
      bgColor = Colors.red[50]!;
      textColor = Colors.red;
      text = 'Stok Habis';
    } else if (stock <= 10) {
      bgColor = Colors.orange[50]!;
      textColor = Colors.orange[800]!;
      text = 'Sisa $stock';
    } else {
      bgColor = Colors.green[50]!;
      textColor = Colors.green[800]!;
      text = 'Tersedia';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: textColor,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            text,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}