import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:Greenly/core/router/app_routes.dart';
import 'package:Greenly/core/theme/app_theme.dart';
import 'package:flutter/material.dart';

class HomeSearchEntryCard extends StatelessWidget {
  const HomeSearchEntryCard({super.key});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, AppRoutes.searchProduct),
      child: Container(
        margin: const EdgeInsets.symmetric(
          horizontal: UIConstants.paddingS,
          vertical: UIConstants.spacingXS,
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: UIConstants.paddingM,
          vertical: UIConstants.spacingL,
        ),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(UIConstants.radiusM),
          border: Border.all(color: Colors.grey.shade200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 6,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Row(
          children: [
            const Icon(
              Icons.search_rounded,
              color: AppTheme.primaryColor,
              size: UIConstants.iconSizeM,
            ),
            const SizedBox(width: UIConstants.spacingM),
            Expanded(
              child: Text(
                'Cari tas bambu, botol reusable, produk organik...',
                style: TextStyle(
                  fontSize: UIConstants.fontSizeM,
                  color: Colors.grey.shade400,
                ),
              ),
            ),
            Icon(
              Icons.tune_rounded,
              color: Colors.grey.shade300,
              size: UIConstants.iconSizeM,
            ),
          ],
        ),
      ),
    );
  }
}
