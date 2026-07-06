import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:Greenly/features/product-detail/bloc/product_detail_bloc.dart';
import 'package:Greenly/features/product-detail/bloc/product_detail_event.dart';
import 'package:Greenly/features/product-detail/bloc/product_detail_state.dart';
import 'package:Greenly/features/product-detail/product_detail_service.dart';
import 'package:Greenly/features/product-detail/product_review_service.dart';
import 'package:Greenly/features/product-detail/widgets/review_item_widget.dart';
import 'package:Greenly/shared/widgets/cart_button_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ReviewsScreen extends StatefulWidget {
  final String productId;
  final String productName;

  const ReviewsScreen({
    super.key,
    required this.productId,
    required this.productName,
  });

  @override
  State<ReviewsScreen> createState() => _ReviewsScreenState();
}

class _ReviewsScreenState extends State<ReviewsScreen> {
  late final ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final pos = _scrollController.position;
    if (pos.pixels >= pos.maxScrollExtent - 300) {
      context.read<ProductDetailBloc>().add(LoadMoreProductReviewsRequested());
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ProductDetailBloc(
        productDetailService: ProductDetailService(),
        productReviewService: ProductReviewService(),
      )..add(GetProductReviewsRequested(productId: widget.productId)),
      child: Scaffold(
        backgroundColor: const Color(0xFFF6FAF6),
        appBar: AppBar(
          elevation: 0,
          backgroundColor: Colors.white,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
            onPressed: () => Navigator.pop(context),
          ),
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Ulasan Produk',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
              Text(
                widget.productName,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[500],
                  fontWeight: FontWeight.w400,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
          actions: const [
            CartButtonWidget(),
            SizedBox(width: UIConstants.spacingXS),
          ],
        ),
        body: BlocBuilder<ProductDetailBloc, ProductDetailState>(
          buildWhen: (p, c) => p.reviews != c.reviews,
          builder: (context, state) {
            final reviews = state.reviews;

            if (reviews.isLoading) {
              return _buildSkeletonList();
            }

            if (reviews.data.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.rate_review_outlined,
                      size: 64,
                      color: Colors.grey[300],
                    ),
                    const SizedBox(height: UIConstants.spacingM),
                    Text(
                      'Belum ada ulasan',
                      style: TextStyle(
                        color: Colors.grey[500],
                        fontSize: UIConstants.fontSizeL,
                      ),
                    ),
                  ],
                ),
              );
            }

            return ListView.separated(
              controller: _scrollController,
              padding: const EdgeInsets.all(UIConstants.paddingM),
              itemCount: reviews.data.length + (reviews.isLoadingMore ? 1 : 0),
              separatorBuilder: (_, _) =>
                  const SizedBox(height: UIConstants.spacingS),
              itemBuilder: (context, index) {
                if (index >= reviews.data.length) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(
                      vertical: UIConstants.paddingM,
                    ),
                    child: Center(child: CircularProgressIndicator()),
                  );
                }
                return ReviewItemWidget(review: reviews.data[index]);
              },
            );
          },
        ),
      ),
    );
  }

  Widget _buildSkeletonList() {
    return ListView.separated(
      padding: const EdgeInsets.all(UIConstants.paddingM),
      itemCount: 6,
      separatorBuilder: (_, _) => const SizedBox(height: UIConstants.spacingS),
      itemBuilder: (_, _) => const _ReviewSkeleton(),
    );
  }
}

class _ReviewSkeleton extends StatelessWidget {
  const _ReviewSkeleton();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(UIConstants.paddingM),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(UIConstants.radiusM),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: UIConstants.spacingS),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 80,
                    height: 12,
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    width: 60,
                    height: 10,
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: UIConstants.spacingS),
          Container(
            width: double.infinity,
            height: 12,
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(height: 6),
          Container(
            width: 200,
            height: 10,
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        ],
      ),
    );
  }
}
