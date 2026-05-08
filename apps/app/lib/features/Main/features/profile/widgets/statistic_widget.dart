import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:flutter/material.dart';

class StatisticWidget extends StatelessWidget {
  final int ordersCount;
  final int followingCounts;
  final int reviewsCount;
  final int favoritesCount;

  const StatisticWidget({
    super.key,
    required this.ordersCount,
    required this.followingCounts,
    required this.reviewsCount,
    required this.favoritesCount,
  });

  @override
  Widget build(BuildContext context) {
    final items = [
      _StatItem('Pesanan', ordersCount, Icons.shopping_bag_outlined),
      _StatItem('Mengikuti', followingCounts, Icons.store_outlined),
      _StatItem('Ulasan', reviewsCount, Icons.star_outline_rounded),
      _StatItem('Favorit', favoritesCount, Icons.favorite_outline_rounded),
    ];

    return Container(
      padding: const EdgeInsets.symmetric(
        vertical: UIConstants.paddingM,
        horizontal: UIConstants.paddingS,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(UIConstants.radiusL),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: items.map((item) {
          return Expanded(child: _buildItem(item));
        }).toList(),
      ),
    );
  }

  Widget _buildItem(_StatItem item) {
    return Column(
      children: [
        Icon(item.icon, size: 22, color: AppTheme.primaryColor),
        const SizedBox(height: UIConstants.spacingXS),
        Text(
          item.count.toString(),
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          item.label,
          style: TextStyle(
            fontSize: UIConstants.fontSizeXS,
            color: Colors.grey[500],
          ),
        ),
      ],
    );
  }
}

class _StatItem {
  final String label;
  final int count;
  final IconData icon;

  const _StatItem(this.label, this.count, this.icon);
}
