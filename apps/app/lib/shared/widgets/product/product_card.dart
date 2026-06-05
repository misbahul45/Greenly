import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/shared/widgets/product/product_badges_row.dart';
import 'package:app/shared/widgets/product/product_card_data.dart';
import 'package:app/shared/widgets/product/product_horizontal_info.dart';
import 'package:app/shared/widgets/product/product_image_box.dart';
import 'package:flutter/material.dart';

class ProductCard extends StatelessWidget {
  final ProductCardData data;
  final VoidCallback? onTap;
  final VoidCallback? onFavoriteTap;
  final VoidCallback? onAddToCart;
  final bool showFavoriteButton;
  final bool showCartButton;
  final bool showEcoBadge;
  final bool showShopName;
  final bool showRating;
  final bool showStock;
  final bool showDiscountBadge;

  const ProductCard({
    super.key,
    required this.data,
    this.onTap,
    this.onFavoriteTap,
    this.onAddToCart,
    this.showFavoriteButton = false,
    this.showCartButton = false,
    this.showEcoBadge = false,
    this.showShopName = false,
    this.showRating = true,
    this.showStock = true,
    this.showDiscountBadge = true,
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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ProductImageBox(
                imageUrl: data.imageUrl,
                isOutOfStock: data.isOutOfStock,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(UIConstants.radiusL),
                ),
                topLeftBadge:
                    data.categoryName != null && data.categoryName!.isNotEmpty
                    ? ProductCategoryBadge(label: data.categoryName!)
                    : null,
                topRightBadge: _topRightBadge(),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(UIConstants.paddingS),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ProductHorizontalInfo(
                        data: data,
                        showEcoBadge: showEcoBadge,
                        showShopName: showShopName,
                        showRating: showRating,
                        showStock: showStock,
                        compact: true,
                      ),
                      const Spacer(),
                      if (showCartButton && onAddToCart != null) ...[
                        const SizedBox(height: UIConstants.spacingXS),
                        _AddButton(
                          onPressed: onAddToCart,
                          isLoading: data.isLoading,
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget? _topRightBadge() {
    if (showFavoriteButton && onFavoriteTap != null) {
      return _FavoriteButton(
        isFavorite: data.isFavorite,
        onPressed: onFavoriteTap!,
      );
    }

    if (showDiscountBadge &&
        data.promotionCode != null &&
        data.promotionCode!.isNotEmpty) {
      return ProductDiscountBadge(label: data.promotionCode!);
    }

    if (showDiscountBadge && data.discountPercent != null) {
      return ProductDiscountBadge(label: '-${data.discountPercent}%');
    }

    return null;
  }
}

class _FavoriteButton extends StatelessWidget {
  final bool isFavorite;
  final VoidCallback onPressed;

  const _FavoriteButton({required this.isFavorite, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit',
      button: true,
      child: Material(
        color: Colors.white.withValues(alpha: 0.92),
        shape: const CircleBorder(),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onPressed,
          child: SizedBox(
            width: 36,
            height: 36,
            child: Icon(
              isFavorite ? Icons.favorite : Icons.favorite_border_rounded,
              size: 18,
              color: isFavorite ? Colors.red : Colors.grey[700],
            ),
          ),
        ),
      ),
    );
  }
}

class _AddButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final bool isLoading;

  const _AddButton({this.onPressed, required this.isLoading});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 32,
      child: ElevatedButton.icon(
        onPressed: isLoading ? null : onPressed,
        icon: isLoading
            ? const SizedBox(
                width: 12,
                height: 12,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : const Icon(Icons.add_shopping_cart_rounded, size: 14),
        label: const Text(
          'Keranjang',
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
        ),
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          backgroundColor: AppTheme.primaryColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(UIConstants.radiusM),
          ),
        ),
      ),
    );
  }
}
