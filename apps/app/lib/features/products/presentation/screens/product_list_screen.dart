import 'package:app/core/constants/ui_constants.dart';
import 'package:app/features/Main/features/home/widgets/product_widget.dart';
import 'package:app/features/products/presentation/bloc/product_list_bloc.dart';
import 'package:app/features/products/service/product_list_service.dart';
import 'package:app/shared/widgets/cart_button_widget.dart';
import 'package:app/shared/widgets/product/product_card_skeleton.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProductListScreen extends StatefulWidget {
  final String? categoryId;
  final String? title;

  const ProductListScreen({super.key, this.categoryId, this.title});

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  late final ProductListBloc _bloc;
  late final ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _bloc = ProductListBloc(ProductListService())
      ..add(ProductListRequested(categoryId: widget.categoryId));
    _scrollController = ScrollController()..addListener(_onScroll);
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final pos = _scrollController.position;
    if (pos.pixels >= pos.maxScrollExtent - 300) {
      _bloc.add(ProductListLoadMoreRequested());
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
          title: Text(
            widget.title ?? 'Produk',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
          ),
          actions: const [
            CartButtonWidget(),
            SizedBox(width: UIConstants.spacingXS),
          ],
        ),
        body: BlocBuilder<ProductListBloc, ProductListState>(
          builder: (context, state) {
            if (state.isLoading) {
              return const ProductCardSkeleton(
                shrinkWrap: false,
                physics: AlwaysScrollableScrollPhysics(),
              );
            }

            if (state.error != null && state.data.isEmpty) {
              return _ErrorView(
                message: state.error!,
                onRetry: () => _bloc.add(
                  ProductListRequested(categoryId: widget.categoryId),
                ),
              );
            }

            if (state.data.isEmpty) {
              return const _EmptyView();
            }

            return RefreshIndicator(
              onRefresh: () async => _bloc.add(
                ProductListRequested(categoryId: widget.categoryId),
              ),
              child: GridView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(UIConstants.paddingM),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: UIConstants.spacingM,
                  mainAxisSpacing: UIConstants.spacingM,
                  childAspectRatio: 0.55,
                ),
                itemCount: state.data.length + (state.isLoadingMore ? 2 : 0),
                itemBuilder: (context, i) {
                  if (i >= state.data.length) {
                    return const ProductCardSkeletonTile();
                  }
                  return ProductWidget(product: state.data[i]);
                },
              ),
            );
          },
        ),
      ),
    );
  }
}

class _EmptyView extends StatelessWidget {
  const _EmptyView();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey[300]),
          const SizedBox(height: UIConstants.spacingM),
          Text(
            'Belum ada produk',
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

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline_rounded, size: 48, color: Colors.grey[300]),
          const SizedBox(height: UIConstants.spacingM),
          Text(
            message,
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey[600]),
          ),
          const SizedBox(height: UIConstants.spacingM),
          ElevatedButton(onPressed: onRetry, child: const Text('Coba Lagi')),
        ],
      ),
    );
  }
}
