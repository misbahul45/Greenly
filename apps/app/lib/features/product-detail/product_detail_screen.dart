import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/product-detail/bloc/product_detail_bloc.dart';
import 'package:app/features/product-detail/bloc/product_detail_event.dart';
import 'package:app/features/product-detail/bloc/product_detail_state.dart';
import 'package:app/features/product-detail/product_detail_service.dart';
import 'package:app/features/product-detail/widgets/product_image_gallery.dart';
import 'package:app/features/product-detail/widgets/price_display_widget.dart';
import 'package:app/features/product-detail/widgets/stock_badge_widget.dart';
import 'package:app/features/product-detail/widgets/rating_review_widget.dart';
import 'package:app/features/product-detail/widgets/product_action_buttons.dart';
import 'package:app/features/product-detail/widgets/shop_info_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProductDetailScreen extends StatelessWidget {
  final String slug;

  const ProductDetailScreen({
    super.key,
    required this.slug,
  });

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ProductDetailBloc(
        productDetailService: ProductDetailService(),
      )..add(GetDetailProduct(slug: slug)),
      child: Scaffold(
        appBar: AppBar(
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () {
              Navigator.pop(context);
            },
          ),
          centerTitle: true,
          title: const Text(
            "Detail Produk",
            style: TextStyle(
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        body: BlocBuilder<ProductDetailBloc, ProductDetailState>(
          builder: (context, state) {
            if (state.product.isLoading) {
              return const Center(
                child: CircularProgressIndicator(),
              );
            }

            if (state.error != null) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 48, color: Colors.grey),
                    const SizedBox(height: 16),
                    Text(state.error!),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        context.read<ProductDetailBloc>().add(
                          GetDetailProduct(slug: slug),
                        );
                      },
                      child: const Text('Coba Lagi'),
                    ),
                  ],
                ),
              );
            }

            final product = state.product.data;

            if (product == null) {
              return const Center(
                child: Text("Produk tidak ditemukan"),
              );
            }

            return SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ProductImageGallery(
                    imageUrls: product.imageUrls,
                    name: product.name,
                    isFavorite: false, // TODO: Connect to favorite bloc
                    onFavoritePressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Toggle favorite'),
                          duration: Duration(seconds: 1),
                        ),
                      );
                    },
                  ),
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Category badge
                        if (product.categoryName.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              product.categoryName,
                              style: TextStyle(
                                fontSize: 12,
                                color: AppTheme.primaryColor,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        const SizedBox(height: 12),

                        // Product name
                        Text(
                          product.name,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),

                        // SKU
                        Text(
                          'SKU: ${product.sku}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Price
                        PriceDisplayWidget(
                          price: product.price,
                          currency: product.currency,
                        ),
                        const SizedBox(height: 12),

                        // Stock
                        StockBadgeWidget(stock: product.stock),
                        const SizedBox(height: 16),

                        // Rating & Reviews
                        RatingReviewWidget(
                          ratingAverage: product.ratingAverage,
                          reviewCount: product.reviewCount,
                          favoriteCount: product.favoriteCount,
                        ),
                        const SizedBox(height: 24),

                        // Shop Info
                        ShopInfoWidget(
                          shopId: product.shopId,
                          categoryName: product.categoryName,
                        ),
                        const SizedBox(height: 24),

                        // Description
                        const Text(
                          'Deskripsi',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          product.description,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[700],
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 100),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
        bottomSheet: BlocBuilder<ProductDetailBloc, ProductDetailState>(
          builder: (context, state) {
            final product = state.product.data;
            if (product == null) return const SizedBox();

            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 8,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: SafeArea(
                child: ProductActionButtons(
                  productId: product.id,
                  shopId: product.shopId,
                  onAddToCartPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Ditambahkan ke keranjang'),
                        duration: Duration(seconds: 1),
                      ),
                    );
                  },
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}