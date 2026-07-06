import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:Greenly/shared/widgets/skeleton/app_skeleton_box.dart';
import 'package:Greenly/shared/widgets/skeleton/app_skeleton_card.dart';
import 'package:Greenly/shared/widgets/skeleton/app_skeleton_line.dart';
import 'package:flutter/material.dart';

class ProductCardSkeleton extends StatelessWidget {
  final int itemCount;
  final int crossAxisCount;
  final double childAspectRatio;
  final EdgeInsetsGeometry padding;
  final bool shrinkWrap;
  final ScrollPhysics? physics;

  const ProductCardSkeleton({
    super.key,
    this.itemCount = 6,
    this.crossAxisCount = 2,
    this.childAspectRatio = 0.55,
    this.padding = const EdgeInsets.all(UIConstants.paddingM),
    this.shrinkWrap = true,
    this.physics = const NeverScrollableScrollPhysics(),
  });

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: shrinkWrap,
      physics: physics,
      padding: padding,
      itemCount: itemCount,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        crossAxisSpacing: UIConstants.spacingM,
        mainAxisSpacing: UIConstants.spacingM,
        childAspectRatio: childAspectRatio,
      ),
      itemBuilder: (_, _) => const ProductCardSkeletonTile(),
    );
  }
}

class ProductCardSkeletonTile extends StatelessWidget {
  const ProductCardSkeletonTile({super.key});

  @override
  Widget build(BuildContext context) {
    return const AppSkeletonCard(
      padding: EdgeInsets.all(UIConstants.paddingS),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 5,
            child: AppSkeletonBox(
              width: double.infinity,
              radius: UIConstants.radiusL,
            ),
          ),
          SizedBox(height: UIConstants.spacingS),
          AppSkeletonLine(width: double.infinity, height: 12),
          SizedBox(height: UIConstants.spacingXS),
          AppSkeletonLine(width: 90, height: 10),
          SizedBox(height: UIConstants.spacingS),
          AppSkeletonLine(width: 80, height: 14),
          Spacer(),
          AppSkeletonBox(
            width: double.infinity,
            height: 32,
            radius: UIConstants.radiusM,
          ),
        ],
      ),
    );
  }
}
