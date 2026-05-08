import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/product-detail/bloc/product_detail_bloc.dart';
import 'package:app/features/product-detail/bloc/product_detail_event.dart';
import 'package:app/features/product-detail/bloc/product_detail_state.dart';
import 'package:app/features/product-detail/widgets/review_item_widget.dart';
import 'package:app/shared/widgets/section_title_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProductReviewsWidget extends StatefulWidget {
  final String productId;
  final String productName;

  const ProductReviewsWidget({
    super.key,
    required this.productId,
    required this.productName,
  });

  @override
  State<ProductReviewsWidget> createState() => _ProductReviewsWidgetState();
}

class _ProductReviewsWidgetState extends State<ProductReviewsWidget> {
  static const int _previewLimit = 3;

  @override
  void initState() {
    super.initState();
    context.read<ProductDetailBloc>().add(
      GetProductReviewsRequested(productId: widget.productId),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProductDetailBloc, ProductDetailState>(
      buildWhen: (p, c) => p.reviews != c.reviews,
      builder: (context, state) {
        final reviews = state.reviews;

        if (reviews.isLoading) {
          return _buildSkeleton();
        }

        if (reviews.data.isEmpty) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: UIConstants.paddingL),
            child: Center(
              child: Column(
                children: [
                  Icon(
                    Icons.rate_review_outlined,
                    size: 40,
                    color: Colors.grey[300],
                  ),
                  const SizedBox(height: UIConstants.spacingS),
                  Text(
                    'Belum ada ulasan',
                    style: TextStyle(
                      color: Colors.grey[500],
                      fontSize: UIConstants.fontSizeM,
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        final preview = reviews.data.take(_previewLimit).toList();
        final hasMore =
            reviews.data.length > _previewLimit || !reviews.hasReachedMax;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SectionTitleWidget(
              title: 'Ulasan Produk',
              onSeeAll: hasMore
                  ? () => Navigator.pushNamed(
                      context,
                      AppRoutes.reviews,
                      arguments: {
                        'productId': widget.productId,
                        'productName': widget.productName,
                      },
                    )
                  : null,
            ),
            const SizedBox(height: UIConstants.spacingS),
            _buildRatingSummary(reviews),
            const SizedBox(height: UIConstants.spacingM),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: preview.length,
              separatorBuilder: (_, _) =>
                  const SizedBox(height: UIConstants.spacingS),
              itemBuilder: (_, i) => ReviewItemWidget(review: preview[i]),
            ),
            if (hasMore) ...[
              const SizedBox(height: UIConstants.spacingM),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => Navigator.pushNamed(
                    context,
                    AppRoutes.reviews,
                    arguments: {
                      'productId': widget.productId,
                      'productName': widget.productName,
                    },
                  ),
                  icon: const Icon(Icons.rate_review_outlined, size: 16),
                  label: Text('Lihat Semua Ulasan (${reviews.data.length}+)'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.primaryColor,
                    side: const BorderSide(color: AppTheme.primaryColor),
                    padding: const EdgeInsets.symmetric(
                      vertical: UIConstants.spacingM,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(UIConstants.radiusM),
                    ),
                  ),
                ),
              ),
            ],
          ],
        );
      },
    );
  }

  Widget _buildRatingSummary(ReviewsState reviews) {
    if (reviews.data.isEmpty) return const SizedBox();

    final avg =
        reviews.data.map((r) => r.rating).reduce((a, b) => a + b) /
        reviews.data.length;
    final total = reviews.data.length;

    return Container(
      padding: const EdgeInsets.all(UIConstants.paddingM),
      decoration: BoxDecoration(
        color: AppTheme.tertiaryColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(UIConstants.radiusM),
        border: Border.all(
          color: AppTheme.tertiaryColor.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        children: [
          Column(
            children: [
              Text(
                avg.toStringAsFixed(1),
                style: const TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.primaryColor,
                ),
              ),
              Row(
                children: List.generate(5, (i) {
                  return Icon(
                    i < avg.round()
                        ? Icons.star_rounded
                        : Icons.star_outline_rounded,
                    size: 14,
                    color: i < avg.round()
                        ? const Color(0xFFFFC107)
                        : Colors.grey[300],
                  );
                }),
              ),
              const SizedBox(height: 2),
              Text(
                '$total ulasan',
                style: TextStyle(
                  fontSize: UIConstants.fontSizeXS,
                  color: Colors.grey[500],
                ),
              ),
            ],
          ),
          const SizedBox(width: UIConstants.spacingL),
          Expanded(
            child: Column(
              children: List.generate(5, (i) {
                final star = 5 - i;
                final count = reviews.data
                    .where((r) => r.rating == star)
                    .length;
                final ratio = total > 0 ? count / total : 0.0;
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2),
                  child: Row(
                    children: [
                      Text(
                        '$star',
                        style: TextStyle(
                          fontSize: UIConstants.fontSizeXS,
                          color: Colors.grey[600],
                        ),
                      ),
                      const SizedBox(width: UIConstants.spacingXS),
                      const Icon(
                        Icons.star_rounded,
                        size: 10,
                        color: Color(0xFFFFC107),
                      ),
                      const SizedBox(width: UIConstants.spacingXS),
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: ratio,
                            backgroundColor: Colors.grey[200],
                            valueColor: const AlwaysStoppedAnimation<Color>(
                              Color(0xFFFFC107),
                            ),
                            minHeight: 6,
                          ),
                        ),
                      ),
                      const SizedBox(width: UIConstants.spacingXS),
                      SizedBox(
                        width: 20,
                        child: Text(
                          '$count',
                          style: TextStyle(
                            fontSize: UIConstants.fontSizeXS,
                            color: Colors.grey[500],
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSkeleton() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionTitleWidget(title: 'Ulasan Produk'),
        const SizedBox(height: UIConstants.spacingS),
        ...List.generate(
          3,
          (_) => Padding(
            padding: const EdgeInsets.only(bottom: UIConstants.spacingS),
            child: Container(
              padding: const EdgeInsets.all(UIConstants.paddingM),
              decoration: BoxDecoration(
                color: Colors.grey[100],
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
                          color: Colors.grey[300],
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
                            color: Colors.grey[300],
                          ),
                          const SizedBox(height: 4),
                          Container(
                            width: 60,
                            height: 10,
                            color: Colors.grey[300],
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: UIConstants.spacingS),
                  Container(
                    width: double.infinity,
                    height: 12,
                    color: Colors.grey[300],
                  ),
                  const SizedBox(height: 6),
                  Container(
                    width: double.infinity,
                    height: 10,
                    color: Colors.grey[300],
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
