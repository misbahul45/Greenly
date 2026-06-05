import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:flutter/material.dart';

class ProductImageBox extends StatelessWidget {
  final String? imageUrl;
  final double? width;
  final double? height;
  final double aspectRatio;
  final BorderRadius borderRadius;
  final bool isOutOfStock;
  final Widget? topLeftBadge;
  final Widget? topRightBadge;

  const ProductImageBox({
    super.key,
    this.imageUrl,
    this.width,
    this.height,
    this.aspectRatio = 1,
    this.borderRadius = const BorderRadius.all(
      Radius.circular(UIConstants.radiusL),
    ),
    this.isOutOfStock = false,
    this.topLeftBadge,
    this.topRightBadge,
  });

  @override
  Widget build(BuildContext context) {
    final box = ClipRRect(
      borderRadius: borderRadius,
      child: Stack(
        fit: StackFit.expand,
        children: [
          _image(),
          if (isOutOfStock) _stockOverlay(),
          if (topLeftBadge != null)
            Positioned(
              left: UIConstants.spacingS,
              top: UIConstants.spacingS,
              child: topLeftBadge!,
            ),
          if (topRightBadge != null)
            Positioned(
              right: UIConstants.spacingS,
              top: UIConstants.spacingS,
              child: topRightBadge!,
            ),
        ],
      ),
    );

    if (width != null || height != null) {
      return SizedBox(width: width, height: height, child: box);
    }

    return AspectRatio(aspectRatio: aspectRatio, child: box);
  }

  Widget _image() {
    final url = imageUrl?.trim();
    final child = url != null && url.isNotEmpty
        ? Image.network(
            url,
            fit: BoxFit.cover,
            cacheWidth: 500,
            errorBuilder: (_, _, _) => const ProductImagePlaceholder(),
          )
        : const ProductImagePlaceholder();

    if (!isOutOfStock) return child;

    return ColorFiltered(
      colorFilter: const ColorFilter.matrix([
        0.2126,
        0.7152,
        0.0722,
        0,
        0,
        0.2126,
        0.7152,
        0.0722,
        0,
        0,
        0.2126,
        0.7152,
        0.0722,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
      ]),
      child: child,
    );
  }

  Widget _stockOverlay() {
    return Container(
      color: Colors.black.withValues(alpha: 0.34),
      alignment: Alignment.center,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: UIConstants.paddingM,
          vertical: UIConstants.spacingXS,
        ),
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.55),
          borderRadius: BorderRadius.circular(999),
        ),
        child: const Text(
          'Stok Habis',
          style: TextStyle(
            color: Colors.white,
            fontSize: UIConstants.fontSizeXS,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    );
  }
}

class ProductImagePlaceholder extends StatelessWidget {
  const ProductImagePlaceholder({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFFF1F8E9),
      alignment: Alignment.center,
      child: Icon(
        Icons.eco_outlined,
        color: AppTheme.primaryColor.withValues(alpha: 0.55),
        size: 36,
      ),
    );
  }
}
