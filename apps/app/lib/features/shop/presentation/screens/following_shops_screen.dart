import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/shop/domain/data/shop_data.dart';
import 'package:app/features/shop/presentation/bloc/following_shops_bloc.dart';
import 'package:app/features/shop/service/shop_service.dart';
import 'package:app/shared/widgets/skeleton/shop_skeleton.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class FollowingShopsScreen extends StatefulWidget {
  const FollowingShopsScreen({super.key});

  @override
  State<FollowingShopsScreen> createState() => _FollowingShopsScreenState();
}

class _FollowingShopsScreenState extends State<FollowingShopsScreen> {
  late final FollowingShopsBloc _bloc;
  late final ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _bloc = FollowingShopsBloc(ShopService())..add(FollowingShopsRequested());
    _scrollController = ScrollController()..addListener(_onScroll);
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final pos = _scrollController.position;
    if (pos.pixels >= pos.maxScrollExtent - 300) {
      _bloc.add(FollowingShopsLoadMoreRequested());
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
            'Toko Diikuti',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
          ),
        ),
        body: BlocBuilder<FollowingShopsBloc, FollowingShopsState>(
          builder: (context, state) {
            if (state.isLoading) {
              return const FollowingShopsSkeleton();
            }

            if (state.data.isEmpty) {
              return _EmptyFollowing(error: state.error);
            }

            return RefreshIndicator(
              onRefresh: () async => _bloc.add(FollowingShopsRequested()),
              child: ListView.separated(
                controller: _scrollController,
                padding: const EdgeInsets.all(UIConstants.paddingM),
                itemCount: state.data.length + (state.isLoadingMore ? 1 : 0),
                separatorBuilder: (_, _) =>
                    const SizedBox(height: UIConstants.spacingS),
                itemBuilder: (context, i) {
                  if (i >= state.data.length) {
                    return const FollowingShopTileSkeleton();
                  }
                  return _ShopTile(shop: state.data[i]);
                },
              ),
            );
          },
        ),
      ),
    );
  }
}

class _ShopTile extends StatelessWidget {
  final ShopData shop;

  const _ShopTile({required this.shop});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(
        context,
        AppRoutes.shopDetail,
        arguments: {'shopId': shop.id, 'following': true},
      ),
      child: Container(
        padding: const EdgeInsets.all(UIConstants.paddingM),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(UIConstants.radiusL),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.storefront_rounded,
                color: AppTheme.primaryColor,
              ),
            ),
            const SizedBox(width: UIConstants.spacingM),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    shop.name,
                    style: const TextStyle(
                      fontSize: UIConstants.fontSizeL,
                      fontWeight: FontWeight.w700,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (shop.description != null &&
                      shop.description!.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(
                      shop.description!,
                      style: TextStyle(
                        fontSize: UIConstants.fontSizeXS,
                        color: Colors.grey[500],
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}

class _EmptyFollowing extends StatelessWidget {
  final String? error;

  const _EmptyFollowing({this.error});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.storefront_outlined, size: 64, color: Colors.grey[300]),
          const SizedBox(height: UIConstants.spacingM),
          Text(
            error ?? 'Belum mengikuti toko apa pun',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.grey[500],
              fontSize: UIConstants.fontSizeL,
            ),
          ),
        ],
      ),
    );
  }
}
