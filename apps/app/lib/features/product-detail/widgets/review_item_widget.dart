import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/product-detail/domains/data/review_data.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class ReviewItemWidget extends StatelessWidget {
  final ReviewData review;

  const ReviewItemWidget({super.key, required this.review});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(UIConstants.paddingM),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(UIConstants.radiusM),
        border: Border.all(color: Colors.grey.shade100),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: AppTheme.tertiaryColor.withValues(alpha: 0.4),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.person_rounded,
                  size: 20,
                  color: AppTheme.primaryColor,
                ),
              ),
              const SizedBox(width: UIConstants.spacingS),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          'Pengguna',
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: UIConstants.fontSizeM,
                          ),
                        ),
                        if (review.isVerified) ...[
                          const SizedBox(width: UIConstants.spacingXS),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor.withValues(
                                alpha: 0.08,
                              ),
                              borderRadius: BorderRadius.circular(
                                UIConstants.radiusS / 2,
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.verified_rounded,
                                  size: 10,
                                  color: AppTheme.primaryColor,
                                ),
                                const SizedBox(width: 2),
                                Text(
                                  'Terverifikasi',
                                  style: TextStyle(
                                    fontSize: 9,
                                    color: AppTheme.primaryColor,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _formatDate(review.createdAt),
                      style: TextStyle(
                        fontSize: UIConstants.fontSizeXS,
                        color: Colors.grey[500],
                      ),
                    ),
                  ],
                ),
              ),
              _buildStars(review.rating),
            ],
          ),
          const SizedBox(height: UIConstants.spacingS),
          Text(
            review.title,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: UIConstants.fontSizeM,
            ),
          ),
          const SizedBox(height: UIConstants.spacingXS),
          Text(
            review.comment,
            style: TextStyle(
              fontSize: UIConstants.fontSizeM,
              color: Colors.grey[700],
              height: 1.5,
            ),
          ),
          if (review.helpfulCount > 0) ...[
            const SizedBox(height: UIConstants.spacingS),
            Row(
              children: [
                Icon(
                  Icons.thumb_up_alt_outlined,
                  size: 13,
                  color: Colors.grey[400],
                ),
                const SizedBox(width: UIConstants.spacingXS),
                Text(
                  '${review.helpfulCount} orang merasa terbantu',
                  style: TextStyle(
                    fontSize: UIConstants.fontSizeXS,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStars(int rating) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) {
        return Icon(
          i < rating ? Icons.star_rounded : Icons.star_outline_rounded,
          size: 14,
          color: i < rating ? const Color(0xFFFFC107) : Colors.grey[300],
        );
      }),
    );
  }

  String _formatDate(DateTime date) {
    return DateFormat('dd MMM yyyy').format(date);
  }
}
