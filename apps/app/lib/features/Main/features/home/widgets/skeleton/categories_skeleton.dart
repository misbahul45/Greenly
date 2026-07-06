import 'package:Greenly/shared/widgets/category/category_grid_skeleton.dart';
import 'package:flutter/material.dart';

class CategoriesSkeleton extends StatelessWidget {
  const CategoriesSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return const CategoryGridSkeleton(itemCount: 9);
  }
}
