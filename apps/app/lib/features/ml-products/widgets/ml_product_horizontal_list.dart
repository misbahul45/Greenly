import 'package:app/core/constants/ui_constants.dart';
import 'package:app/features/ml-products/domain/ml_product_result.dart';
import 'package:app/features/ml-products/widgets/ml_product_card.dart';
import 'package:flutter/material.dart';

class MlProductHorizontalList extends StatelessWidget {
  final List<MlProductResult> products;

  const MlProductHorizontalList({super.key, required this.products});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 230,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: UIConstants.paddingM),
        itemCount: products.length,
        separatorBuilder: (_, _) =>
            const SizedBox(width: UIConstants.spacingM),
        itemBuilder: (_, index) => MlProductCard(product: products[index]),
      ),
    );
  }
}
