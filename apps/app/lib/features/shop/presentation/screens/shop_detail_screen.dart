import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/Main/features/home/widgets/product_widget.dart';
import 'package:app/features/products/presentation/bloc/product_list_bloc.dart';
import 'package:app/features/products/service/product_list_service.dart';
import 'package:app/features/shop/presentation/bloc/shop_detail_bloc.dart';
import 'package:app/features/shop/service/shop_service.dart';
import 'package:app/shared/widgets/cart_button_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ShopDetailScreen extends StatefulWidget {
  final String shopId;
  final bool initiallyFollowing;

  const ShopDetailScreen({
    super.key,
    required this.shopId,
    this.initiallyFollowing = false,
  });

  @override
  State<ShopDetailScreen> createState() => _ShopDetailScreenState();
}

class _ShopDetailScreenState extends State<ShopDetailScreen> {
  late final ShopDetailBloc _shopBloc;
  late final ProductListBloc _productBloc;
  late final ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _shopBloc = ShopDetailBloc(ShopService())
      ..add(
        ShopDetailRequested(
          widget.shopId,
          initiallyFollowing: widget.initiallyFollowing,
        ),
      );
    _productBloc = ProductListBloc(ProductListService())
      ..add(ProductListRequested(shopId: widget.shopId));
    _scrollController = ScrollController()..addListener(_onScroll);
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final pos = _scrollController.position;
    if (pos.pixels >= pos.maxScrollExtent - 300) {
      _productBloc.add(ProductListLoadMoreRequested());
    }
  }

  @override
  void dispose() {
    _shopBloc.close();
    _productBloc.close();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider.value(value: _shopBloc),
        BlocProvider.value(value: _productBloc),
      ],
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
            'Toko',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
          ),
          actions: const [
            CartButtonWidget(),
            SizedBox(width: UIConstants.spacingXS),
          ],
        ),
        body: BlocConsumer<ShopDetailBloc, ShopDetailState>(
          listenWhen: (p, c) => c.error != null && p.error != c.error,
          listener: (context, state) {
            if (state.error != null) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(state.error!),
                  backgroundColor: Colors.red,
                ),
              );
            }
          },
          builder: (context, shopState) {
            if (shopState.isLoading && shopState.shop == null) {
              return const Center(child: CircularProgressIndicator());
            }

            if (shopState.shop == null) {
              return Center(
                child: Text(
                  shopState.error ?? 'Toko tidak ditemukan',
                  style: TextStyle(color: Colors.grey[600]),
                ),
              );
            }

            return CustomScrollView(
              controller: _scrollController,
              slivers: [
                SliverToBoxAdapter(child: _ShopHeader(state: shopState)),
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(
                      UIConstants.paddingM,
                      UIConstants.spacingM,
                      UIConstants.paddingM,
                      UIConstants.spacingS,
                    ),
                    child: Text(
                      'Produk Toko',
                      style: TextStyle(
                        fontSize: UIConstants.fontSizeL,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
                _buildProductSliver(),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildProductSliver() {
    return BlocBuilder<ProductListBloc, ProductListState>(
      builder: (context, state) {
        if (state.isLoading) {
          return const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.all(UIConstants.paddingXL),
              child: Center(child: CircularProgressIndicator()),
            ),
          );
        }

        if (state.data.isEmpty) {
          return SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(UIConstants.paddingXL),
              child: Center(
                child: Text(
                  'Belum ada produk',
                  style: TextStyle(color: Colors.grey[500]),
                ),
              ),
            ),
          );
        }

        return SliverPadding(
          padding: const EdgeInsets.all(UIConstants.paddingM),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: UIConstants.spacingM,
              mainAxisSpacing: UIConstants.spacingM,
              childAspectRatio: 0.62,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, i) => ProductWidget(product: state.data[i]),
              childCount: state.data.length,
            ),
          ),
        );
      },
    );
  }
}

class _ShopHeader extends StatelessWidget {
  final ShopDetailState state;

  const _ShopHeader({required this.state});

  @override
  Widget build(BuildContext context) {
    final shop = state.shop!;
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(UIConstants.paddingL),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 32,
                backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                backgroundImage:
                    shop.avatarUrl == null || shop.avatarUrl!.isEmpty
                    ? null
                    : NetworkImage(shop.avatarUrl!),
                child: shop.avatarUrl == null || shop.avatarUrl!.isEmpty
                    ? const Icon(
                        Icons.storefront_rounded,
                        size: 32,
                        color: AppTheme.primaryColor,
                      )
                    : null,
              ),
              const SizedBox(width: UIConstants.spacingL),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      shop.name,
                      style: const TextStyle(
                        fontSize: UIConstants.fontSizeXL,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${state.followerCount} pengikut',
                      style: TextStyle(
                        fontSize: UIConstants.fontSizeXS,
                        color: Colors.grey[500],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (shop.description != null && shop.description!.isNotEmpty) ...[
            const SizedBox(height: UIConstants.spacingM),
            Text(
              shop.description!,
              style: TextStyle(
                fontSize: UIConstants.fontSizeM,
                color: Colors.grey[700],
                height: 1.5,
              ),
            ),
          ],
          const SizedBox(height: UIConstants.spacingL),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.pushNamed(
                      context,
                      AppRoutes.chat,
                      arguments: {
                        'shopId': shop.id,
                        'shopName': shop.name,
                        'shopAvatarUrl': shop.avatarUrl,
                      },
                    );
                  },
                  icon: const Icon(Icons.chat_bubble_outline_rounded, size: 18),
                  label: const Text('Chat Toko'),
                ),
              ),
              const SizedBox(width: UIConstants.spacingM),
              Expanded(
                child: state.isFollowing
                    ? OutlinedButton.icon(
                        onPressed: state.isToggling
                            ? null
                            : () => context.read<ShopDetailBloc>().add(
                                ShopFollowToggled(),
                              ),
                        icon: const Icon(Icons.check_rounded, size: 18),
                        label: const Text('Mengikuti'),
                      )
                    : ElevatedButton.icon(
                        onPressed: state.isToggling
                            ? null
                            : () => context.read<ShopDetailBloc>().add(
                                ShopFollowToggled(),
                              ),
                        icon: const Icon(Icons.add_rounded, size: 18),
                        label: const Text('Ikuti Toko'),
                      ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
