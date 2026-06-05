import 'package:app/core/router/app_routes.dart';
import 'package:app/features/Main/features/home/domains/data/product_data.dart';
import 'package:app/features/Main/features/home/domains/data/promotion_data.dart';
import 'package:app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:app/shared/widgets/product/product_card.dart';
import 'package:app/shared/widgets/product/product_card_data.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProductWidget extends StatelessWidget {
  final ProductData product;
  final PromotionData? promotion;

  const ProductWidget({super.key, required this.product, this.promotion});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CartBloc, CartState>(
      buildWhen: (p, c) => p.isAdding(product.id) != c.isAdding(product.id),
      builder: (context, state) {
        final data = ProductCardData(
          productId: product.id,
          slug: product.slug,
          name: product.name,
          imageUrl: product.imageUrls.isNotEmpty
              ? product.imageUrls.first
              : null,
          price: product.price,
          rating: product.ratingAverage,
          reviewCount: product.reviewCount,
          favoriteCount: product.favoriteCount,
          stock: product.stock,
          categoryName: product.categoryName,
          shopName: product.shopName.isNotEmpty ? product.shopName : null,
          ecoScore: product.ecoScore > 0 ? product.ecoScore : null,
          promotionCode: promotion?.code,
          isLoading: state.isAdding(product.id),
        );

        return ProductCard(
          data: data,
          showCartButton: true,
          showStock: true,
          onTap: product.slug.isEmpty
              ? null
              : () => Navigator.pushNamed(
                  context,
                  AppRoutes.productDetail,
                  arguments: product.slug,
                ),
          onAddToCart: () {
            context.read<CartBloc>().add(
              CartAddItemRequested(productId: product.id),
            );
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Ditambahkan ke keranjang'),
                duration: Duration(seconds: 1),
                behavior: SnackBarBehavior.floating,
              ),
            );
          },
        );
      },
    );
  }
}
