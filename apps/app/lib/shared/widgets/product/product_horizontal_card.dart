import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:Greenly/core/theme/app_theme.dart';
import 'package:Greenly/shared/widgets/product/product_badges_row.dart';
import 'package:Greenly/shared/widgets/product/product_card_data.dart';
import 'package:Greenly/shared/widgets/product/product_horizontal_info.dart';
import 'package:Greenly/shared/widgets/product/product_image_box.dart';
import 'package:flutter/material.dart';

class ProductHorizontalCard extends StatelessWidget {
  final ProductCardData data;
  final VoidCallback? onTap;
  final VoidCallback? onRemove;
  final ValueChanged<int>? onQuantityChanged;
  final double imageSize;
  final bool showEcoBadge;
  final bool showStock;
  final bool showQuantityControl;
  final bool showRemoveButton;

  const ProductHorizontalCard({
    super.key,
    required this.data,
    this.onTap,
    this.onRemove,
    this.onQuantityChanged,
    this.imageSize = 72,
    this.showEcoBadge = true,
    this.showStock = false,
    this.showQuantityControl = false,
    this.showRemoveButton = false,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(UIConstants.radiusM),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(UIConstants.radiusM),
        child: Ink(
          padding: const EdgeInsets.all(UIConstants.paddingM),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(UIConstants.radiusM),
            border: Border.all(color: Colors.grey.shade200),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ProductImageBox(
                imageUrl: data.imageUrl,
                width: imageSize,
                height: imageSize,
                isOutOfStock: data.isOutOfStock,
                borderRadius: BorderRadius.circular(UIConstants.radiusM),
              ),
              const SizedBox(width: UIConstants.spacingM),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ProductHorizontalInfo(
                      data: data,
                      showEcoBadge: showEcoBadge,
                      showStock: showStock,
                      showRating: false,
                    ),
                    if (data.fromFallback) ...[
                      const SizedBox(height: UIConstants.spacingXS),
                      const ProductFallbackBadge(),
                    ],
                    if (showQuantityControl && data.quantity != null) ...[
                      const SizedBox(height: UIConstants.spacingS),
                      _QuantityControl(
                        quantity: data.quantity!,
                        loading: data.isLoading,
                        onChanged: onQuantityChanged,
                      ),
                    ],
                  ],
                ),
              ),
              if (showRemoveButton && onRemove != null) ...[
                const SizedBox(width: UIConstants.spacingS),
                _RemoveButton(onPressed: onRemove!, loading: data.isLoading),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _QuantityControl extends StatelessWidget {
  final int quantity;
  final bool loading;
  final ValueChanged<int>? onChanged;

  const _QuantityControl({
    required this.quantity,
    required this.loading,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _QtyButton(
          icon: Icons.remove_rounded,
          onTap: quantity <= 1 || loading
              ? null
              : () => onChanged?.call(quantity - 1),
        ),
        Container(
          width: 36,
          alignment: Alignment.center,
          child: Text(
            '$quantity',
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
          ),
        ),
        _QtyButton(
          icon: Icons.add_rounded,
          onTap: loading ? null : () => onChanged?.call(quantity + 1),
        ),
      ],
    );
  }
}

class _QtyButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;

  const _QtyButton({required this.icon, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(UIConstants.radiusM),
        child: Container(
          width: 40,
          height: 40,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: onTap == null
                ? Colors.grey.shade100
                : AppTheme.primaryColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(UIConstants.radiusM),
          ),
          child: Icon(
            icon,
            size: 18,
            color: onTap == null ? Colors.grey[400] : AppTheme.primaryColor,
          ),
        ),
      ),
    );
  }
}

class _RemoveButton extends StatelessWidget {
  final VoidCallback onPressed;
  final bool loading;

  const _RemoveButton({required this.onPressed, required this.loading});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Hapus produk',
      button: true,
      child: InkWell(
        onTap: loading ? null : onPressed,
        borderRadius: BorderRadius.circular(UIConstants.radiusM),
        child: SizedBox(
          width: 40,
          height: 40,
          child: loading
              ? const Center(
                  child: SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.red,
                    ),
                  ),
                )
              : const Icon(
                  Icons.delete_outline_rounded,
                  size: 20,
                  color: Colors.red,
                ),
        ),
      ),
    );
  }
}
