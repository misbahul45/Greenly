import 'package:app/core/constants/ui_constants.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_box.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_card.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_line.dart';
import 'package:flutter/material.dart';

class ProductHorizontalCardSkeleton extends StatelessWidget {
  final int itemCount;
  final EdgeInsetsGeometry padding;

  const ProductHorizontalCardSkeleton({
    super.key,
    this.itemCount = 5,
    this.padding = const EdgeInsets.all(UIConstants.paddingM),
  });

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: padding,
      itemCount: itemCount,
      separatorBuilder: (_, _) => const SizedBox(height: UIConstants.spacingM),
      itemBuilder: (_, _) => const ProductHorizontalCardSkeletonTile(),
    );
  }
}

class ProductHorizontalCardSkeletonTile extends StatelessWidget {
  const ProductHorizontalCardSkeletonTile({super.key});

  @override
  Widget build(BuildContext context) {
    return const AppSkeletonCard(
      child: Row(
        children: [
          AppSkeletonBox(width: 72, height: 72, radius: UIConstants.radiusM),
          SizedBox(width: UIConstants.spacingM),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppSkeletonLine(width: double.infinity, height: 12),
                SizedBox(height: UIConstants.spacingXS),
                AppSkeletonLine(width: 150, height: 10),
                SizedBox(height: UIConstants.spacingS),
                AppSkeletonLine(width: 90, height: 14),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
