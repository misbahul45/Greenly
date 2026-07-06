import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:Greenly/shared/widgets/charts/stat_card.dart';
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
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: UIConstants.spacingM,
      mainAxisSpacing: UIConstants.spacingM,
      childAspectRatio: 1.2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        StatCard(
          label: 'Pesanan',
          value: '$ordersCount',
          icon: Icons.shopping_bag_outlined,
        ),
        StatCard(
          label: 'Mengikuti',
          value: '$followingCounts',
          icon: Icons.storefront_outlined,
        ),
        StatCard(
          label: 'Ulasan',
          value: '$reviewsCount',
          icon: Icons.star_outline_rounded,
        ),
        StatCard(
          label: 'Favorit',
          value: '$favoritesCount',
          icon: Icons.favorite_outline_rounded,
        ),
      ],
    );
  }
}
