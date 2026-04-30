// product_image_section.dart
import 'package:app/features/Main/features/home/model/data/promotion_data.dart';
import 'package:app/features/Main/features/home/widgets/product_image_placeholder.dart';
import 'package:app/features/Main/features/home/widgets/product_promo_badge.dart';
import 'package:flutter/material.dart';

class ProductImageSection extends StatelessWidget {
  final String image;
  final bool hasPromo;
  final PromotionData? promotion;
  final String categoryName;
  final bool isOutOfStock;

  const ProductImageSection({
    super.key,
    required this.image,
    required this.hasPromo,
    required this.promotion,
    required this.categoryName,
    required this.isOutOfStock,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        AspectRatio(
          aspectRatio: 1.05,
          child: ClipRRect(
            borderRadius:
                const BorderRadius.vertical(top: Radius.circular(16)),
            child: ColorFiltered(
              colorFilter: isOutOfStock
                  ? const ColorFilter.matrix([
                      0.2126, 0.7152, 0.0722, 0, 0,
                      0.2126, 0.7152, 0.0722, 0, 0,
                      0.2126, 0.7152, 0.0722, 0, 0,
                      0,      0,      0,      1, 0,
                    ])
                  : const ColorFilter.mode(
                      Colors.transparent,
                      BlendMode.multiply,
                    ),
              child: image.isNotEmpty
                  ? Image.network(
                      image,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) =>
                          const ProductImagePlaceholder(),
                    )
                  : const ProductImagePlaceholder(),
            ),
          ),
        ),
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: ClipRRect(
            borderRadius:
                const BorderRadius.vertical(top: Radius.circular(16)),
            child: Container(
              height: 36,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [
                    Colors.black.withOpacity(0.22),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
        ),
        if (categoryName.isNotEmpty)
          Positioned(
            top: 8,
            left: 8,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.45),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                categoryName,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 9,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.3,
                ),
              ),
            ),
          ),
        if (hasPromo && promotion != null)
          Positioned(
            top: 0,
            right: 0,
            child: ProductPromoBadge(label: promotion!.code),
          ),
        if (isOutOfStock)
          Positioned.fill(
            child: ClipRRect(
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(16)),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.55),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'Stok Habis',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}