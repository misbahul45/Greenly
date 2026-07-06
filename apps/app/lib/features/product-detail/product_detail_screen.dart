import 'dart:async';

import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:Greenly/core/router/app_routes.dart';
import 'package:Greenly/core/theme/app_theme.dart';
import 'package:Greenly/features/product-detail/bloc/product_detail_bloc.dart';
import 'package:Greenly/features/product-detail/bloc/product_detail_event.dart';
import 'package:Greenly/features/product-detail/bloc/product_detail_state.dart';
import 'package:Greenly/features/product-detail/product_detail_service.dart';
import 'package:Greenly/features/product-detail/product_review_service.dart';
import 'package:Greenly/features/product-detail/widgets/product_image_gallery.dart';
import 'package:Greenly/features/product-detail/widgets/price_display_widget.dart';
import 'package:Greenly/features/product-detail/widgets/stock_badge_widget.dart';
import 'package:Greenly/features/product-detail/widgets/rating_review_widget.dart';
import 'package:Greenly/features/product-detail/widgets/shop_info_widget.dart';
import 'package:Greenly/features/product-detail/widgets/product_reviews_widget.dart';
import 'package:Greenly/features/Main/features/home/bloc/home_bloc.dart';
import 'package:Greenly/features/Main/features/home/bloc/home_event.dart';
import 'package:Greenly/features/Main/features/home/bloc/home_state.dart';
import 'package:Greenly/features/Main/features/home/home_service.dart';
import 'package:Greenly/features/Main/features/home/widgets/product_grid.dart';
import 'package:Greenly/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:Greenly/features/favorite/bloc/favorite_bloc.dart';
import 'package:Greenly/features/favorite/service/favorite_service.dart';
import 'package:Greenly/features/ml-products/service/ml_product_service.dart';
import 'package:Greenly/features/product-detail/bloc/similar_products_bloc.dart';
import 'package:Greenly/features/product-detail/widgets/similar_products_section.dart';
import 'package:Greenly/shared/widgets/cart_button_widget.dart';
import 'package:Greenly/shared/widgets/product/product_card_skeleton.dart';
import 'package:Greenly/features/Main/features/home/domains/data/product_data.dart' show EcoData;
import 'package:Greenly/features/Main/features/home/domains/data/promotion_data.dart';
import 'package:Greenly/shared/widgets/product/product_badges_row.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProductDetailScreen extends StatefulWidget {
  final String slug;

  const ProductDetailScreen({super.key, required this.slug});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  late final ScrollController _scrollController;
  late final ProductDetailBloc _detailBloc;
  late final HomeBloc _homeBloc;
  late final FavoriteBloc _favoriteBloc;
  late final SimilarProductsBloc _similarBloc;

  @override
  void initState() {
    super.initState();

    _detailBloc = ProductDetailBloc(
      productDetailService: ProductDetailService(),
      productReviewService: ProductReviewService(),
    )..add(GetDetailProduct(slug: widget.slug));

    _homeBloc = HomeBloc(HomeService())..add(GetFeaturedProductsRequested());
    _favoriteBloc = FavoriteBloc(FavoriteService());
    _similarBloc = SimilarProductsBloc(MlProductService());

    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final pos = _scrollController.position;
    if (pos.pixels >= pos.maxScrollExtent - 300) {
      _homeBloc.add(LoadMoreProductsRequested());
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _detailBloc.close();
    _homeBloc.close();
    _favoriteBloc.close();
    _similarBloc.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider.value(value: _detailBloc),
        BlocProvider.value(value: _homeBloc),
        BlocProvider.value(value: _favoriteBloc),
        BlocProvider.value(value: _similarBloc),
      ],
      child: _ProductDetailView(
        slug: widget.slug,
        scrollController: _scrollController,
      ),
    );
  }
}

class _ProductDetailView extends StatelessWidget {
  final String slug;
  final ScrollController scrollController;

  const _ProductDetailView({
    required this.slug,
    required this.scrollController,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6FAF6),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () {
            if (Navigator.canPop(context)) {
              Navigator.pop(context);
              return;
            }
            Navigator.pushReplacementNamed(context, AppRoutes.main);
          },
        ),
        centerTitle: true,
        title: const Text(
          'Detail Produk',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
        actions: const [
          CartButtonWidget(),
          SizedBox(width: UIConstants.spacingXS),
        ],
      ),
      body: BlocBuilder<ProductDetailBloc, ProductDetailState>(
        buildWhen: (p, c) => p.product != c.product || p.error != c.error,
        builder: (context, state) {
          if (state.product.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline_rounded,
                    size: 48,
                    color: Colors.grey[300],
                  ),
                  const SizedBox(height: UIConstants.spacingM),
                  Text(state.error!, style: TextStyle(color: Colors.grey[600])),
                  const SizedBox(height: UIConstants.spacingM),
                  ElevatedButton(
                    onPressed: () => context.read<ProductDetailBloc>().add(
                      GetDetailProduct(slug: slug),
                    ),
                    child: const Text('Coba Lagi'),
                  ),
                ],
              ),
            );
          }

          final product = state.product.data;
          if (product == null) {
            return Center(
              child: Text(
                'Produk tidak ditemukan',
                style: TextStyle(color: Colors.grey[500]),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              context.read<ProductDetailBloc>().add(
                GetDetailProduct(slug: slug),
              );
            },
            child: SingleChildScrollView(
              controller: scrollController,
              padding: const EdgeInsets.only(bottom: 100),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  BlocListener<FavoriteBloc, FavoriteState>(
                    listenWhen: (p, c) => c.error != null && p.error != c.error,
                    listener: (context, state) {
                      if (state.error != null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(state.error!),
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      }
                    },
                    child: BlocBuilder<FavoriteBloc, FavoriteState>(
                      buildWhen: (p, c) =>
                          p.isFavorite != c.isFavorite ||
                          p.isLoading != c.isLoading ||
                          p.isToggling != c.isToggling,
                      builder: (context, favState) {
                        if (favState.productId == null && !favState.isLoading) {
                          context.read<FavoriteBloc>().add(
                            FavoriteCheckRequested(productId: product.id),
                          );
                        }
                        return ProductImageGallery(
                          imageUrls: product.imageUrls,
                          name: product.name,
                          isFavorite: favState.isFavorite,
                          isTogglingFavorite:
                              favState.isToggling || favState.isLoading,
                          onFavoritePressed: () =>
                              context.read<FavoriteBloc>().add(
                                FavoriteToggleRequested(productId: product.id),
                              ),
                        );
                      },
                    ),
                  ),
                  Container(
                    color: Colors.white,
                    padding: const EdgeInsets.all(UIConstants.paddingM),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (product.categoryName.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor.withValues(
                                alpha: 0.1,
                              ),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              product.categoryName,
                              style: const TextStyle(
                                fontSize: 12,
                                color: AppTheme.primaryColor,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        const SizedBox(height: UIConstants.spacingS),
                        Text(
                          product.name,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: UIConstants.spacingXS),
                        Text(
                          'SKU: ${product.sku}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[500],
                          ),
                        ),
                        const SizedBox(height: UIConstants.spacingM),
                        PriceDisplayWidget(
                          price: product.finalPrice > 0 ? product.finalPrice : product.price,
                          originalPrice: product.originalPrice > product.finalPrice ? product.originalPrice : null,
                          discountPercent: product.promotion?.discountPercent.toInt(),
                          currency: product.currency,
                        ),
                        if (product.promotion != null && product.promotion!.hasPromo) ...[
                          const SizedBox(height: UIConstants.spacingM),
                          _PromoSection(promotion: product.promotion!),
                        ],
                        const SizedBox(height: UIConstants.spacingS),
                        StockBadgeWidget(stock: product.stock),
                        const SizedBox(height: UIConstants.spacingM),
                        RatingReviewWidget(
                          ratingAverage: product.ratingAverage,
                          reviewCount: product.reviewCount,
                          favoriteCount: product.favoriteCount,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingS),
                  if (product.eco != null) ...[
                    _SustainabilitySection(eco: product.eco!),
                    const SizedBox(height: UIConstants.spacingS),
                  ],
                  Container(
                    color: Colors.white,
                    padding: const EdgeInsets.all(UIConstants.paddingM),
                    child: ShopInfoWidget(
                      shopId: product.shopId,
                      shopName: product.shopName.isNotEmpty
                          ? product.shopName
                          : null,
                      categoryName: product.categoryName,
                      productId: product.id,
                      productName: product.name,
                      productImageUrl: product.imageUrls.isNotEmpty
                          ? product.imageUrls.first
                          : null,
                      productSlug: product.slug,
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingS),
                  Container(
                    color: Colors.white,
                    padding: const EdgeInsets.all(UIConstants.paddingM),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Deskripsi Produk',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: UIConstants.spacingS),
                        Text(
                          product.description,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[700],
                            height: 1.6,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingS),
                  Container(
                    color: Colors.white,
                    padding: const EdgeInsets.all(UIConstants.paddingM),
                    child: ProductReviewsWidget(
                      productId: product.id,
                      productName: product.name,
                    ),
                  ),
                  const SizedBox(height: UIConstants.spacingS),
                  SimilarProductsSection(productId: product.id),
                  const SizedBox(height: UIConstants.spacingS),
                  const _RelatedProductsSection(),
                ],
              ),
            ),
          );
        },
      ),
      bottomNavigationBar: BlocBuilder<ProductDetailBloc, ProductDetailState>(
        buildWhen: (p, c) => p.product != c.product,
        builder: (context, state) {
          final product = state.product.data;
          if (product == null) return const SizedBox.shrink();

          return Container(
            padding: const EdgeInsets.fromLTRB(
              UIConstants.paddingM,
              UIConstants.spacingM,
              UIConstants.paddingM,
              UIConstants.spacingM,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.08),
                  blurRadius: 12,
                  offset: const Offset(0, -3),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: AppTheme.primaryColor.withValues(alpha: 0.4),
                      ),
                      borderRadius: BorderRadius.circular(UIConstants.radiusM),
                    ),
                    child: IconButton(
                      onPressed: () {
                        _addToCart(context, product.id);
                      },
                      icon: const Icon(
                        Icons.shopping_cart_outlined,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                  ),
                  const SizedBox(width: UIConstants.spacingM),
                  Expanded(
                    child: SizedBox(
                      height: UIConstants.buttonHeight,
                      child: ElevatedButton(
                        onPressed: () => _addToCart(
                          context,
                          product.id,
                          openCartOnSuccess: true,
                        ),
                        child: const Text(
                          'Beli Sekarang',
                          style: TextStyle(
                            fontSize: UIConstants.fontSizeL,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Future<void> _addToCart(
    BuildContext context,
    String productId, {
    bool openCartOnSuccess = false,
  }) async {
    final cartBloc = context.read<CartBloc>();
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);

    cartBloc.add(CartAddItemRequested(productId: productId));

    final state = await cartBloc.stream
        .firstWhere((state) => !state.isAdding(productId))
        .timeout(const Duration(seconds: 12), onTimeout: () => cartBloc.state);

    if (!context.mounted) return;

    if (state.error != null) {
      messenger.showSnackBar(
        SnackBar(content: Text(state.error!), backgroundColor: Colors.red),
      );
      return;
    }

    messenger.showSnackBar(
      SnackBar(
        content: Text(
          openCartOnSuccess
              ? 'Produk ditambahkan. Lanjutkan checkout dari keranjang.'
              : 'Ditambahkan ke keranjang',
        ),
        duration: const Duration(seconds: 1),
      ),
    );

    if (openCartOnSuccess) {
      await navigator.pushNamed(AppRoutes.cart);
    }
  }
}

class _PromoSection extends StatelessWidget {
  final PromotionData promotion;

  const _PromoSection({required this.promotion});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(UIConstants.paddingM),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF3E0),
        borderRadius: BorderRadius.circular(UIConstants.radiusM),
        border: Border.all(color: Colors.orange.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.local_offer_rounded, color: Colors.orange, size: 20),
              const SizedBox(width: 8),
              Text(
                promotion.label,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: Colors.orange,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  promotion.title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: Colors.black87,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            promotion.savingLabel,
            style: const TextStyle(
              fontSize: 12,
              color: Colors.black54,
              fontWeight: FontWeight.w500,
            ),
          ),
          if (promotion.code.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              'Kode: ${promotion.code}',
              style: TextStyle(
                fontSize: 12,
                color: Colors.orange.shade800,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _SustainabilitySection extends StatelessWidget {
  final EcoData eco;

  const _SustainabilitySection({required this.eco});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(UIConstants.paddingM),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Kenapa produk ini ramah lingkungan?',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Colors.black87,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'Eco ${eco.score.toInt()}',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.primaryColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: UIConstants.spacingM),
          EcoAttributeChips(badges: eco.badges, compact: false),
          const SizedBox(height: UIConstants.spacingM),
          ...eco.reasons.map((reason) => Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.check_circle_rounded,
                        color: AppTheme.primaryColor, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        reason,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[700],
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              )),
          const SizedBox(height: UIConstants.spacingS),
          Row(
            children: [
              _InfoChip(label: 'Bahan: ${eco.materialLabel}', icon: Icons.grass_rounded),
              const SizedBox(width: 8),
              _InfoChip(
                label: 'Carbon: ${eco.carbonLabel}',
                icon: Icons.co2_rounded,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final String label;
  final IconData icon;

  const _InfoChip({required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.grey[600]),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: Colors.grey[700],
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _RelatedProductsSection extends StatelessWidget {
  const _RelatedProductsSection();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<HomeBloc, HomeState>(
      buildWhen: (p, c) => p.product != c.product,
      builder: (context, state) {
        if (state.product.isLoading) {
          return Container(
            color: Colors.white,
            padding: const EdgeInsets.all(UIConstants.paddingM),
            child: const ProductCardSkeleton(padding: EdgeInsets.zero),
          );
        }

        if (state.product.data.isEmpty) return const SizedBox.shrink();

        return Container(
          color: Colors.white,
          padding: const EdgeInsets.all(UIConstants.paddingM),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Produk Lainnya',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Colors.black87,
                    ),
                  ),
                  if (state.product.isLoadingMore)
                    const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: UIConstants.spacingM),
              ProductGrid(state: state.product),
            ],
          ),
        );
      },
    );
  }
}
