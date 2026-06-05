enum ProductCardVariant { grid, horizontal, compact }

class ProductCardData {
  final String productId;
  final String? slug;
  final String name;
  final String? imageUrl;
  final int price;
  final int? originalPrice;
  final int? discountPercent;
  final double? rating;
  final int? reviewCount;
  final int? favoriteCount;
  final int? soldCount;
  final int? stock;
  final double? ecoScore;
  final String? semanticReason;
  final String? shopName;
  final String? categoryName;
  final String? promotionCode;
  final bool isFavorite;
  final bool fromFallback;
  final int? quantity;
  final bool isLoading;
  final ProductCardVariant variant;

  const ProductCardData({
    required this.productId,
    this.slug,
    required this.name,
    this.imageUrl,
    required this.price,
    this.originalPrice,
    this.discountPercent,
    this.rating,
    this.reviewCount,
    this.favoriteCount,
    this.soldCount,
    this.stock,
    this.ecoScore,
    this.semanticReason,
    this.shopName,
    this.categoryName,
    this.promotionCode,
    this.isFavorite = false,
    this.fromFallback = false,
    this.quantity,
    this.isLoading = false,
    this.variant = ProductCardVariant.grid,
  });

  bool get isOutOfStock => stock != null && stock! <= 0;
  bool get isLowStock => stock != null && stock! > 0 && stock! <= 5;
}
