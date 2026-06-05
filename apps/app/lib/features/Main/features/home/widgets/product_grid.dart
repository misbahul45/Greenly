import 'package:app/core/constants/ui_constants.dart';
import 'package:app/features/Main/features/home/bloc/home_state.dart';
import 'package:app/features/Main/features/home/widgets/product_widget.dart';
import 'package:app/shared/widgets/product/product_card_skeleton.dart';
import 'package:flutter/material.dart';

class ProductGrid extends StatelessWidget {
  final ProductState state;
  final EdgeInsetsGeometry padding;
  final bool shrinkWrap;
  final ScrollPhysics? physics;

  const ProductGrid({
    super.key,
    required this.state,
    this.padding = const EdgeInsets.symmetric(horizontal: UIConstants.paddingM),
    this.shrinkWrap = true,
    this.physics = const NeverScrollableScrollPhysics(),
  });

  @override
  Widget build(BuildContext context) {
    if (state.isLoading) {
      return ProductCardSkeleton(padding: padding);
    }

    if (state.data.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(UIConstants.paddingL),
        child: Center(child: Text('Belum ada produk')),
      );
    }

    return GridView.builder(
      shrinkWrap: shrinkWrap,
      physics: physics,
      padding: padding,
      itemCount: state.data.length + (state.isLoadingMore ? 2 : 0),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: UIConstants.spacingM,
        mainAxisSpacing: UIConstants.spacingM,
        childAspectRatio: 0.55,
      ),
      itemBuilder: (context, index) {
        if (index >= state.data.length) {
          return const ProductCardSkeletonTile();
        }
        return ProductWidget(product: state.data[index]);
      },
    );
  }
}
