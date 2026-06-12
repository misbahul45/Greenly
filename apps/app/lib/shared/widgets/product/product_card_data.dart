enum ProductCardVariant { grid, horizontal, compact }

class ProductCardData {
  final String productId;
  final String? slug;
  final String name;
  final String? imageUrl;
  final int price;
  final int? originalPrice;
  final int? finalPrice;
  final int? discountPercent;
  final int? discountAmount;
  final String? savingLabel;
  final double? rating;
  final int? reviewCount;
  final int? favoriteCount;
  final int? soldCount;
  final int? stock;
  
  // Eco Attributes
  final double? ecoScore;
  final String? ecoLabel;
  final String? materialType;
  final String? materialLabel;
  final bool? recyclable;
  final double? carbonFootprint;
  final String? carbonLabel;
  final List<String>? ecoBadges;
  final List<String>? ecoReasons;
  
  final String? semanticReason;
  final String? shopName;
  final String? categoryName;
  
  // Promotion
  final bool hasPromo;
  final String? promotionCode;
  final String? promotionLabel;
  
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
    this.finalPrice,
    this.discountPercent,
    this.discountAmount,
    this.savingLabel,
    this.rating,
    this.reviewCount,
    this.favoriteCount,
    this.soldCount,
    this.stock,
    this.ecoScore,
    this.ecoLabel,
    this.materialType,
    this.materialLabel,
    this.recyclable,
    this.carbonFootprint,
    this.carbonLabel,
    this.ecoBadges,
    this.ecoReasons,
    this.semanticReason,
    this.shopName,
    this.categoryName,
    this.hasPromo = false,
    this.promotionCode,
    this.promotionLabel,
    this.isFavorite = false,
    this.fromFallback = false,
    this.quantity,
    this.isLoading = false,
    this.variant = ProductCardVariant.grid,
  });

  bool get isOutOfStock => stock != null && stock! <= 0;
  bool get isLowStock => stock != null && stock! > 0 && stock! <= 5;
  int get effectivePrice => finalPrice ?? price;
  bool get displayPromo => hasPromo || (promotionCode != null && promotionCode!.isNotEmpty);
}
