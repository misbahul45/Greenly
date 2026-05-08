import 'package:app/features/Main/features/home/bloc/home_state.dart';
import 'package:app/features/Main/features/home/widgets/product_widget.dart';
import 'package:app/features/Main/features/home/widgets/skeleton/product_item_loading.dart';
import 'package:app/features/Main/features/home/widgets/skeleton/product_skeleton.dart';
import 'package:flutter/material.dart';
import 'package:app/core/constants/ui_constants.dart';

class ProductGrid extends StatelessWidget {
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

    final totalCount = state.data.length + (state.isLoadingMore ? 2 : 0);

    final leftColumn = <Widget>[];
    final rightColumn = <Widget>[];

    for (int i = 0; i < totalCount; i++) {
      final child = i >= state.data.length
          ? const ProductItemLoading()
          : ProductWidget(product: state.data[i]);

      final padded = Padding(
        padding: const EdgeInsets.only(bottom: UIConstants.spacingS),
        child: child,
      );

      i.isEven ? leftColumn.add(padded) : rightColumn.add(padded);
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: UIConstants.paddingS),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: leftColumn,
            ),
          ),
          const SizedBox(width: UIConstants.spacingS),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: rightColumn,
            ),
          ),
        ],
      ),
    );
  }
}