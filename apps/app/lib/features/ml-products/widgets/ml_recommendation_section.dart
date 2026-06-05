import 'package:app/core/constants/ui_constants.dart';
import 'package:app/features/ml-products/domain/ml_product_result.dart';
import 'package:app/features/ml-products/widgets/ml_product_horizontal_list.dart';
import 'package:flutter/material.dart';

class MlRecommendationSection extends StatelessWidget {
  final String title;
  final List<MlProductResult> products;
  final bool isLoading;
  final String? error;
  final VoidCallback? onRetry;

  const MlRecommendationSection({
    super.key,
    required this.title,
    this.products = const [],
    this.isLoading = false,
    this.error,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    if (!isLoading && products.isEmpty && error == null) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(
            UIConstants.paddingM,
            UIConstants.spacingS,
            UIConstants.paddingM,
            UIConstants.spacingXS,
          ),
          child: Text(
            title,
            style: const TextStyle(
              fontSize: UIConstants.fontSizeL,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        if (isLoading)
          const _SkeletonRow()
        else if (error != null)
          _ErrorRow(message: error!, onRetry: onRetry)
        else
          MlProductHorizontalList(products: products),
      ],
    );
  }
}

class _SkeletonRow extends StatelessWidget {
  const _SkeletonRow();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 230,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: UIConstants.paddingM),
        itemCount: 4,
        separatorBuilder: (_, _) =>
            const SizedBox(width: UIConstants.spacingM),
        itemBuilder: (_, _) => Container(
          width: 150,
          decoration: BoxDecoration(
            color: Colors.grey.shade200,
            borderRadius: BorderRadius.circular(UIConstants.radiusM),
          ),
        ),
      ),
    );
  }
}

class _ErrorRow extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;

  const _ErrorRow({required this.message, this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: UIConstants.paddingM,
        vertical: UIConstants.spacingS,
      ),
      child: Row(
        children: [
          Icon(Icons.wifi_off_rounded, size: 16, color: Colors.grey.shade400),
          const SizedBox(width: UIConstants.spacingXS),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                fontSize: UIConstants.fontSizeS,
                color: Colors.grey.shade500,
              ),
            ),
          ),
          if (onRetry != null)
            TextButton(
              onPressed: onRetry,
              child: const Text('Coba lagi'),
            ),
        ],
      ),
    );
  }
}
