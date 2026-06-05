import 'package:app/core/constants/ui_constants.dart';
import 'package:app/features/Main/features/home/domains/data/category_data.dart';
import 'package:app/shared/widgets/category/category_card.dart';
import 'package:flutter/material.dart';

class CategoryGrid extends StatelessWidget {
  final List<CategoryData> categories;
  final void Function(CategoryData category)? onTap;
  final ScrollController? controller;
  final ScrollPhysics? physics;
  final EdgeInsetsGeometry padding;
  final int crossAxisCount;
  final double childAspectRatio;
  final bool shrinkWrap;
  final int? itemCountOverride;
  final Widget Function(BuildContext context, int index)? loadingItemBuilder;

  const CategoryGrid({
    super.key,
    required this.categories,
    this.onTap,
    this.controller,
    this.physics,
    this.padding = const EdgeInsets.all(UIConstants.paddingM),
    this.crossAxisCount = 3,
    this.childAspectRatio = 0.95,
    this.shrinkWrap = false,
    this.itemCountOverride,
    this.loadingItemBuilder,
  });

  @override
  Widget build(BuildContext context) {
    final itemCount = itemCountOverride ?? categories.length;

    return GridView.builder(
      controller: controller,
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
      itemBuilder: (context, index) {
        if (index >= categories.length) {
          return loadingItemBuilder?.call(context, index) ??
              const SizedBox.shrink();
        }

        final category = categories[index];
        return CategoryCard(
          id: category.id,
          name: category.name,
          onTap: onTap == null ? null : () => onTap!(category),
        );
      },
    );
  }
}
