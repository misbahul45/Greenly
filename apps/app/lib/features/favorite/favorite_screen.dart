import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/core/utils/currency_helper.dart';
import 'package:app/features/favorite/bloc/favorite_bloc.dart';
import 'package:app/features/favorite/domain/data/favorite_data.dart';
import 'package:app/features/favorite/service/favorite_service.dart';
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
          title: const Text(
            'Favorit Saya',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
          ),
        ),
        body: BlocBuilder<FavoriteBloc, FavoriteState>(
          buildWhen: (p, c) =>
              p.isListLoading != c.isListLoading ||
              p.favorites != c.favorites ||
              p.isListLoadingMore != c.isListLoadingMore,
          builder: (context, state) {
            if (state.isListLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            if (state.favorites.isEmpty) {
              return const _EmptyFavorite();
            }

            return RefreshIndicator(
              onRefresh: () async => _bloc.add(FavoriteListRequested()),
              child: GridView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(UIConstants.paddingM),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: UIConstants.spacingM,
                  mainAxisSpacing: UIConstants.spacingM,
                  childAspectRatio: 0.72,
                ),
                itemCount:
                    state.favorites.length + (state.isListLoadingMore ? 2 : 0),
                itemBuilder: (context, i) {
                  if (i >= state.favorites.length) {
                    return Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(
                          UIConstants.radiusM,
                        ),
                      ),
                    );
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
    return GestureDetector(
      onTap: () {
        if (product.slug.isNotEmpty) {
          Navigator.pushNamed(
            context,
            AppRoutes.productDetail,
            arguments: product.slug,
          );
        }
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(UIConstants.radiusM),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(UIConstants.radiusM),
                  ),
                  child: product.imageUrl.isNotEmpty
                      ? Image.network(
                          product.imageUrl,
                          height: 130,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (_, _, _) => _placeholder(),
                        )
                      : _placeholder(),
                ),
                Positioned(
                  top: UIConstants.spacingS,
                  right: UIConstants.spacingS,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.9),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.favorite,
                      color: Colors.red,
                      size: 18,
                    ),
                  ),
                ),
              ],
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(
                  UIConstants.spacingS,
                  UIConstants.spacingXS,
                  UIConstants.spacingS,
                  UIConstants.spacingS,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name.isNotEmpty ? product.name : 'Produk',
                      style: const TextStyle(
                        fontSize: UIConstants.fontSizeS,
                        fontWeight: FontWeight.w600,
                        color: Colors.black87,
                        height: 1.3,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const Spacer(),
                    if (product.ratingAverage > 0)
                      Row(
                        children: [
                          const Icon(
                            Icons.star_rounded,
                            size: 12,
                            color: Color(0xFFFFC107),
                          ),
                          const SizedBox(width: 2),
                          Text(
                            product.ratingAverage.toStringAsFixed(1),
                            style: TextStyle(
                              fontSize: UIConstants.fontSizeXS,
                              color: Colors.grey[600],
                            ),
                          ),
                          Text(
                            '  (${product.reviewCount})',
                            style: TextStyle(
                              fontSize: UIConstants.fontSizeXS,
                              color: Colors.grey[400],
                            ),
                          ),
                        ],
                      ),
                    const SizedBox(height: UIConstants.spacingXS),
                    Text(
                      CurrencyHelper.formatRupiah(product.price),
                      style: const TextStyle(
                        fontSize: UIConstants.fontSizeM,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _placeholder() {
    return Container(
      height: 130,
      width: double.infinity,
      color: AppTheme.tertiaryColor.withValues(alpha: 0.2),
      child: const Icon(
        Icons.shopping_bag_outlined,
        color: AppTheme.primaryColor,
        size: 36,
      ),
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
