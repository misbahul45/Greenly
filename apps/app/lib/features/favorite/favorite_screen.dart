import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:Greenly/core/router/app_routes.dart';
import 'package:Greenly/core/theme/app_theme.dart';
import 'package:Greenly/features/favorite/bloc/favorite_bloc.dart';
import 'package:Greenly/features/favorite/domain/data/favorite_data.dart';
import 'package:Greenly/features/favorite/service/favorite_service.dart';
import 'package:Greenly/shared/widgets/product/adaptive_product_grid_delegate.dart';
import 'package:Greenly/shared/widgets/product/product_card.dart';
import 'package:Greenly/shared/widgets/product/product_card_data.dart';
import 'package:Greenly/shared/widgets/product/product_card_skeleton.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class FavoriteScreen extends StatefulWidget {
  const FavoriteScreen({super.key});

  @override
  State<FavoriteScreen> createState() => _FavoriteScreenState();
}

class _FavoriteScreenState extends State<FavoriteScreen> {
  late final FavoriteBloc _bloc;
  late final ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _bloc = FavoriteBloc(FavoriteService())..add(FavoriteListRequested());
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final pos = _scrollController.position;
    if (pos.pixels >= pos.maxScrollExtent - 300) {
      _bloc.add(FavoriteLoadMoreRequested());
    }
  }

  @override
  void dispose() {
    _bloc.close();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: _bloc,
      child: Scaffold(
        backgroundColor: const Color(0xFFF6FAF6),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
            onPressed: () => Navigator.pop(context),
          ),
          centerTitle: true,
          title: BlocBuilder<FavoriteBloc, FavoriteState>(
            buildWhen: (p, c) =>
                p.totalFavorites != c.totalFavorites ||
                p.isListLoading != c.isListLoading,
            builder: (context, state) {
              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Favorit Saya',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                  if (!state.isListLoading && state.totalFavorites > 0) ...[
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '${state.totalFavorites}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ],
              );
            },
          ),
        ),
        body: BlocBuilder<FavoriteBloc, FavoriteState>(
          buildWhen: (p, c) =>
              p.isListLoading != c.isListLoading ||
              p.favorites != c.favorites ||
              p.isListLoadingMore != c.isListLoadingMore,
          builder: (context, state) {
            if (state.isListLoading) {
              return const ProductCardSkeleton(
                shrinkWrap: false,
                physics: AlwaysScrollableScrollPhysics(),
              );
            }

            if (state.favorites.isEmpty) {
              return const _EmptyFavorite();
            }

            return RefreshIndicator(
              onRefresh: () async => _bloc.add(FavoriteListRequested()),
              child: GridView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(UIConstants.paddingM),
                gridDelegate: adaptiveProductGridDelegate(),
                itemCount:
                    state.favorites.length + (state.isListLoadingMore ? 2 : 0),
                itemBuilder: (context, i) {
                  if (i >= state.favorites.length) {
                    return const ProductCardSkeletonTile();
                  }
                  return _FavoriteProductCard(product: state.favorites[i]);
                },
              ),
            );
          },
        ),
      ),
    );
  }
}

class _FavoriteProductCard extends StatelessWidget {
  final FavoriteProductData product;

  const _FavoriteProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    return ProductCard(
      data: ProductCardData(
        productId: product.productId,
        slug: product.slug,
        name: product.name.isEmpty ? 'Produk' : product.name,
        imageUrl: product.imageUrl,
        price: product.price,
        rating: product.ratingAverage > 0 ? product.ratingAverage : null,
        reviewCount: product.reviewCount,
        favoriteCount: product.favoriteCount > 0 ? product.favoriteCount : null,
        stock: product.stock,
        categoryName: product.categoryName.isNotEmpty
            ? product.categoryName
            : null,
        shopName: product.shopName.isNotEmpty ? product.shopName : null,
        isFavorite: true,
      ),
      showFavoriteButton: true,
      onTap: product.slug.isEmpty
          ? null
          : () => Navigator.pushNamed(
              context,
              AppRoutes.productDetail,
              arguments: product.slug,
            ),
      onFavoriteTap: () {
        context.read<FavoriteBloc>().add(
          FavoriteToggleRequested(productId: product.productId),
        );
      },
    );
  }
}

class _EmptyFavorite extends StatelessWidget {
  const _EmptyFavorite();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: AppTheme.tertiaryColor.withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.favorite_outline_rounded,
              size: 48,
              color: AppTheme.primaryColor,
            ),
          ),
          const SizedBox(height: UIConstants.spacingXXL),
          const Text(
            'Belum Ada Favorit',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: UIConstants.spacingS),
          Text(
            'Tambahkan produk ke favorit\ndengan menekan ikon hati',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: UIConstants.fontSizeM,
              color: Colors.grey[500],
              height: 1.5,
            ),
          ),
          const SizedBox(height: UIConstants.spacingXXXL),
          ElevatedButton.icon(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.explore_outlined, size: 18),
            label: const Text('Jelajahi Produk'),
          ),
        ],
      ),
    );
  }
}
