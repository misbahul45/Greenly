import 'package:app/core/router/app_routes.dart';
import 'package:app/shared/widgets/category/category_card.dart';
import 'package:flutter/material.dart';

class CategoryWidget extends StatelessWidget {
  final String id;
  final String title;

  const CategoryWidget({super.key, required this.id, required this.title});

  @override
  Widget build(BuildContext context) {
    return CategoryCard(
      id: id,
      name: title,
      onTap: () => Navigator.pushNamed(
        context,
        AppRoutes.categoryProducts,
        arguments: {'categoryId': id, 'categoryName': title},
      ),
    );
  }
}
