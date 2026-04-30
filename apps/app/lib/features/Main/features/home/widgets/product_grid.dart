import 'package:app/features/Main/features/home/bloc/home_state.dart';
import 'package:app/features/Main/features/home/widgets/product_widget.dart';
import 'package:app/features/Main/features/home/widgets/skeleton/product_item_loading.dart';
import 'package:app/features/Main/features/home/widgets/skeleton/product_skeleton.dart';
import 'package:flutter/material.dart';

class ProductGrid extends StatelessWidget {
  // ✅ Tidak perlu ScrollController lagi
  final ProductState state;

  const ProductGrid({
    super.key,
    required this.state,
  });

  @override
  Widget build(BuildContext context) {
    if (state.isLoading) {
      return const ProductSkeleton();
    }

    if (state.data.isEmpty) {
      return const Center(child: Text("No products"));
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 12),
      itemCount: state.isLoadingMore
          ? state.data.length + 2
          : state.data.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.72,
      ),
      itemBuilder: (context, index) {
        if (index >= state.data.length) {
          return const ProductItemLoading();
        }

        final item = state.data[index];
        return ProductWidget(product: item);
      },
    );
  }
}