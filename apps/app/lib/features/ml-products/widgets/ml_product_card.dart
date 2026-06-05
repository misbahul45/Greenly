import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/core/utils/currency_helper.dart';
import 'package:app/features/ml-products/domain/ml_product_result.dart';
import 'package:app/features/ml-products/widgets/eco_score_badge.dart';
import 'package:app/features/ml-products/widgets/semantic_reason_chip.dart';
import 'package:flutter/material.dart';

class MlProductCard extends StatelessWidget {
  final MlProductResult product;

  const MlProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: product.slug?.isNotEmpty == true
          ? () => Navigator.pushNamed(
                context,
                AppRoutes.productDetail,
                arguments: product.slug,
              )
          : null,
      child: Container(
        width: 150,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(UIConstants.radiusM),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            _ProductImage(imageUrl: product.imageUrl),
            Padding(
              padding: const EdgeInsets.all(UIConstants.paddingS),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: UIConstants.fontSizeS,
                      height: 1.3,
                    ),
                  ),
                  if (product.reason.isNotEmpty) ...[
                    const SizedBox(height: UIConstants.spacingXS),
                    SemanticReasonChip(reason: product.reason),
                  ],
                  if (product.ecoScore != null) ...[
                    const SizedBox(height: UIConstants.spacingXS),
                    EcoScoreBadge(score: product.ecoScore!, compact: true),
                  ],
                  if (product.price != null) ...[
                    const SizedBox(height: UIConstants.spacingXS),
                    Text(
                      CurrencyHelper.formatRupiah(product.price!),
                      style: const TextStyle(
                        color: AppTheme.primaryColor,
                        fontWeight: FontWeight.w700,
                        fontSize: UIConstants.fontSizeS,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProductImage extends StatelessWidget {
  final String? imageUrl;

  const _ProductImage({this.imageUrl});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: const BorderRadius.vertical(
        top: Radius.circular(UIConstants.radiusM),
      ),
      child: SizedBox(
        width: double.infinity,
        height: 110,
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
      color: const Color(0xFFF1F8E9),
      child: const Center(
        child: Icon(
          Icons.eco_outlined,
          color: AppTheme.primaryColor,
          size: 32,
        ),
      ),
    );
  }
}
