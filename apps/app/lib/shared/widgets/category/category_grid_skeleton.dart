import 'package:app/core/constants/ui_constants.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_box.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_card.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_line.dart';
import 'package:flutter/material.dart';

class CategoryGridSkeleton extends StatelessWidget {
  final int itemCount;
  final int crossAxisCount;
  final double childAspectRatio;
  final EdgeInsetsGeometry padding;
  final bool shrinkWrap;
  final ScrollPhysics? physics;

  const CategoryGridSkeleton({
    super.key,
    this.itemCount = 9,
    this.crossAxisCount = 3,
    this.childAspectRatio = 0.95,
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
      itemBuilder: (_, _) => const CategoryCardSkeleton(),
    );
  }
}

class CategoryCardSkeleton extends StatelessWidget {
  const CategoryCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return const AppSkeletonCard(
      padding: EdgeInsets.all(UIConstants.paddingS),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AppSkeletonBox(width: 48, height: 48, radius: UIConstants.radiusL),
          SizedBox(height: UIConstants.spacingS),
          AppSkeletonLine(width: 64, height: 10),
          SizedBox(height: 4),
          AppSkeletonLine(width: 42, height: 10),
        ],
      ),
    );
  }
}
