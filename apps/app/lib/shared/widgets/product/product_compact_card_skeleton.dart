import 'package:app/core/constants/ui_constants.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_box.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_card.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_line.dart';
import 'package:flutter/material.dart';

class ProductCompactCardSkeleton extends StatelessWidget {
  final double width;

  const ProductCompactCardSkeleton({super.key, this.width = 150});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      child: const AppSkeletonCard(
        padding: EdgeInsets.all(UIConstants.paddingS),
        radius: UIConstants.radiusM,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AppSkeletonBox(
              width: double.infinity,
              height: 110,
              radius: UIConstants.radiusM,
            ),
            SizedBox(height: UIConstants.spacingS),
            AppSkeletonLine(width: double.infinity, height: 12),
            SizedBox(height: UIConstants.spacingXS),
            AppSkeletonLine(width: 90, height: 10),
            SizedBox(height: UIConstants.spacingS),
            AppSkeletonBox(width: 58, height: 18, radius: 999),
            Spacer(),
            AppSkeletonLine(width: 82, height: 14),
          ],
        ),
      ),
    );
  }
}

class ProductCompactSkeletonRow extends StatelessWidget {
  final int itemCount;

  const ProductCompactSkeletonRow({super.key, this.itemCount = 4});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 230,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: UIConstants.paddingM),
        itemCount: itemCount,
        separatorBuilder: (_, _) => const SizedBox(width: UIConstants.spacingM),
        itemBuilder: (_, _) => const ProductCompactCardSkeleton(),
      ),
    );
  }
}
