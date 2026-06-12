import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:flutter/material.dart';

class CategoryCard extends StatelessWidget {
  final String id;
  final String name;
  final String? imageUrl;
  final IconData icon;
  final int? productCount;
  final VoidCallback? onTap;

  const CategoryCard({
    super.key,
    required this.id,
    required this.name,
    this.imageUrl,
    this.icon = Icons.category_rounded,
    this.productCount,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(UIConstants.radiusL),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(UIConstants.radiusL),
        child: Ink(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(UIConstants.radiusL),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          padding: const EdgeInsets.all(UIConstants.paddingS),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _iconBox(),
              const SizedBox(height: UIConstants.spacingS),
              Text(
                name,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: UIConstants.fontSizeS,
                  fontWeight: FontWeight.w700,
                  color: Colors.black87,
                  height: 1.25,
                ),
              ),
              if (productCount != null) ...[
                const SizedBox(height: 2),
                Text(
                  '$productCount produk',
                  style: TextStyle(
                    fontSize: UIConstants.fontSizeXS,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _iconBox() {
    final url = imageUrl?.trim();
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: AppTheme.primaryColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(UIConstants.radiusL),
      ),
      clipBehavior: Clip.antiAlias,
      child: url != null && url.isNotEmpty
          ? Image.network(
              url,
              fit: BoxFit.cover,
              cacheWidth: 160,
              errorBuilder: (_, _, _) =>
                  Icon(icon, color: AppTheme.primaryColor, size: 24),
            )
          : Icon(icon, color: AppTheme.primaryColor, size: 24),
    );
  }
}
