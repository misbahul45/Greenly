import 'package:flutter/material.dart';
import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';

class BecomeSellerWidget extends StatelessWidget {
  final VoidCallback? onTap;

  const BecomeSellerWidget({super.key, this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(UIConstants.radiusL),
      child: Container(
        padding: const EdgeInsets.all(UIConstants.paddingL),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(UIConstants.radiusL),
          border: Border.all(
            color: Colors.grey.withOpacity(0.2),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.storefront,
                color: AppTheme.primaryColor,
                size: UIConstants.iconSizeM,
              ),
            ),

            const SizedBox(width: UIConstants.spacingL),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Mulai Jual",
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: UIConstants.spacingXS),
                  Text(
                    "Buka toko dan mulai jual produkmu",
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey,
                        ),
                  ),
                ],
              ),
            ),

            const Icon(
              Icons.chevron_right,
              size: UIConstants.iconSizeL,
              color: Colors.grey,
            ),
          ],
        ),
      ),
    );
  }
}