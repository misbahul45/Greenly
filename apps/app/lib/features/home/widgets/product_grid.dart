import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/models/product_model.dart';
import 'package:app/features/home/widgets/product_card.dart';
import 'package:flutter/material.dart';

class ProductGrid extends StatelessWidget {
  final List<ProductModel> products;

  const ProductGrid({super.key, required this.products});

  @override
  Widget build(BuildContext context) {
    if (products.isEmpty) {
      return SliverToBoxAdapter(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(48),
            child: Column(
              children: [
                Icon(Icons.search_off_rounded, size: 64, color: Colors.grey[300]),
                const SizedBox(height: UIConstants.spacingM),
                Text(
                  'Produk tidak ditemukan',
                  style: TextStyle(color: Colors.grey[400], fontSize: 14),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: UIConstants.paddingM),
      sliver: SliverGrid(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: UIConstants.spacingM,
          mainAxisSpacing: UIConstants.spacingM,
          childAspectRatio: 0.68,
        ),
        delegate: SliverChildBuilderDelegate(
          (ctx, i) => ProductCard(product: products[i]),
          childCount: products.length,
        ),
      ),
    );
  }
}
