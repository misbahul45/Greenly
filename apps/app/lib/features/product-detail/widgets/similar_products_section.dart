import 'package:app/core/constants/ui_constants.dart';
import 'package:app/features/ml-products/widgets/ml_product_horizontal_list.dart';
import 'package:app/features/product-detail/bloc/similar_products_bloc.dart';
import 'package:app/features/product-detail/bloc/similar_products_event.dart';
import 'package:app/features/product-detail/bloc/similar_products_state.dart';
import 'package:app/shared/widgets/product/product_compact_card_skeleton.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class SimilarProductsSection extends StatefulWidget {
  final String productId;

  const SimilarProductsSection({super.key, required this.productId});

  @override
  State<SimilarProductsSection> createState() => _SimilarProductsSectionState();
}

class _SimilarProductsSectionState extends State<SimilarProductsSection> {
  @override
  void initState() {
    super.initState();
    _fetch(widget.productId);
  }

  @override
  void didUpdateWidget(SimilarProductsSection old) {
    super.didUpdateWidget(old);
    if (old.productId != widget.productId) {
      _fetch(widget.productId);
    }
  }

  void _fetch(String productId) {
    context.read<SimilarProductsBloc>().add(
      SimilarProductsRequested(productId: productId),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SimilarProductsBloc, SimilarProductsState>(
      builder: (context, state) {
        if (!state.isLoading && state.products.isEmpty) {
          return const SizedBox.shrink();
        }

        return Container(
          color: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: UIConstants.paddingM),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Padding(
                padding: EdgeInsets.fromLTRB(
                  UIConstants.paddingM,
                  0,
                  UIConstants.paddingM,
                  UIConstants.spacingS,
                ),
                child: Text(
                  'Produk Mirip',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Colors.black87,
                  ),
                ),
              ),
              if (state.isLoading)
                const ProductCompactSkeletonRow()
              else
                MlProductHorizontalList(products: state.products),
            ],
          ),
        );
      },
    );
  }
}
