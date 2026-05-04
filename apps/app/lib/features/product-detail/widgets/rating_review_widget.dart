import 'package:app/core/theme/app_theme.dart';
import 'package:flutter/material.dart';

class RatingReviewWidget extends StatelessWidget {
  final double ratingAverage;
  final int reviewCount;
  final int favoriteCount;

  const RatingReviewWidget({
    super.key,
    required this.ratingAverage,
    required this.reviewCount,
    required this.favoriteCount,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.amber[50],
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              const Icon(Icons.star, color: Colors.amber, size: 16),
              const SizedBox(width: 4),
              Text(
                ratingAverage.toStringAsFixed(1),
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 16),
        _buildStatItem(Icons.chat_bubble_outline, '$reviewCount Ulasan'),
        const SizedBox(width: 16),
        _buildStatItem(Icons.favorite_border, '$favoriteCount Favorite'),
      ],
    );
  }

  Widget _buildStatItem(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.grey[600]),
        const SizedBox(width: 4),
        Text(
          text,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }
}