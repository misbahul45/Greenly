// product_stats_row.dart
import 'package:flutter/material.dart';

class ProductStatsRow extends StatelessWidget {
  final double ratingAverage;
  final int reviewCount;
  final int favoriteCount;

  const ProductStatsRow({
    super.key,
    required this.ratingAverage,
    required this.reviewCount,
    required this.favoriteCount,
  });

  String _formatCount(int count) {
    if (count >= 1000) return '${(count / 1000).toStringAsFixed(1)}k';
    return count.toString();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.star_rounded, size: 13, color: Color(0xFFFFC107)),
        const SizedBox(width: 2),
        Text(
          ratingAverage.toStringAsFixed(1),
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: Color(0xFF1A1A2E),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Text('·', style: TextStyle(color: Colors.grey.shade400, fontSize: 11)),
        ),
        const Icon(Icons.chat_bubble_outline_rounded, size: 11, color: Color(0xFF90A4AE)),
        const SizedBox(width: 2),
        Text(
          _formatCount(reviewCount),
          style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Text('·', style: TextStyle(color: Colors.grey.shade400, fontSize: 11)),
        ),
        const Icon(Icons.favorite_rounded, size: 11, color: Color(0xFFEF5350)),
        const SizedBox(width: 2),
        Text(
          _formatCount(favoriteCount),
          style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
        ),
      ],
    );
  }
}