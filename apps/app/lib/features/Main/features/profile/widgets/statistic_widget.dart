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

  Widget _buildStatisticItem(String label, int count) {
    return Column(
      children: [
        Text(
          count.toString(),
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            color: Colors.grey,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _buildStatisticItem("Orders", ordersCount),
        _buildStatisticItem("Following", followingCounts),
        _buildStatisticItem("Reviews", reviewsCount),
        _buildStatisticItem("Favorites", favoritesCount),
      ],
    );
  }
}