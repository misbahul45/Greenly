import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/core/utils/currency_helper.dart';
import 'package:app/features/search-product/domain/data/search_product_result.dart';
import 'package:flutter/material.dart';

class SearchResultCard extends StatelessWidget {
  final SearchProductResult result;
  final VoidCallback? onTap;

  const SearchResultCard({super.key, required this.result, this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(UIConstants.radiusM),
      child: Container(
        padding: const EdgeInsets.all(UIConstants.paddingM),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(UIConstants.radiusM),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _ProductThumbnail(imageUrl: result.imageUrl),
            const SizedBox(width: UIConstants.spacingM),
            Expanded(child: _ProductInfo(result: result)),
          ],
        ),
      ),
    );
  }
}

class _ProductThumbnail extends StatelessWidget {
  final String? imageUrl;

  const _ProductThumbnail({this.imageUrl});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(UIConstants.radiusS),
      child: SizedBox(
        width: 72,
        height: 72,
        child: imageUrl != null && imageUrl!.isNotEmpty
            ? Image.network(
                imageUrl!,
                fit: BoxFit.cover,
                errorBuilder: (_, _, _) => _placeholder(),
              )
            : _placeholder(),
      ),
    );
  }

  Widget _placeholder() {
    return Container(
      color: Colors.grey.shade100,
      child: const Icon(Icons.eco_outlined, color: AppTheme.primaryColor),
    );
  }
}

class _ProductInfo extends StatelessWidget {
  final SearchProductResult result;

  const _ProductInfo({required this.result});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          result.name,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: UIConstants.fontSizeS,
          ),
        ),
        if (result.reason != null && result.reason!.isNotEmpty) ...[
          const SizedBox(height: UIConstants.spacingXS),
          Text(
            result.reason!,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: UIConstants.fontSizeXS,
              color: Colors.grey.shade600,
            ),
          ),
        ],
        const SizedBox(height: UIConstants.spacingS),
        Row(
          children: [
            if (result.price != null)
              Text(
                CurrencyHelper.formatRupiah(result.price!),
                style: const TextStyle(
                  color: AppTheme.primaryColor,
                  fontWeight: FontWeight.w800,
                  fontSize: UIConstants.fontSizeM,
                ),
              ),
            if (result.ecoScore != null) ...[
              const SizedBox(width: UIConstants.spacingS),
              _EcoBadge(score: result.ecoScore!),
            ],
            if (result.fromFallback) ...[
              const SizedBox(width: UIConstants.spacingS),
              _FallbackLabel(),
            ],
          ],
        ),
      ],
    );
  }
}

class _EcoBadge extends StatelessWidget {
  final double score;

  const _EcoBadge({required this.score});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: AppTheme.primaryColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        'Eco ${score.round()}',
        style: const TextStyle(
          color: AppTheme.primaryColor,
          fontSize: UIConstants.fontSizeXS,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _FallbackLabel extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.grey.shade200,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        'Katalog',
        style: TextStyle(
          fontSize: UIConstants.fontSizeXS,
          color: Colors.grey.shade600,
        ),
      ),
    );
  }
}
