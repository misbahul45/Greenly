import '../../../../../../shared/widgets/product/product_card_data.dart';

class ProductData {
  final String id;
  final String shopId;
  final String categoryId;
  final String name;
  final String slug;
  final String description;
  final String sku;

  final int favoriteCount;
  final int reviewCount;
  final double ratingAverage;
  final double ecoScore;

  final bool isActive;

  final int price;
  final int originalPrice;
  final int finalPrice;
  final String currency;
  final int stock;

  final List<String> imageUrls;

  final String categoryName;
  final String shopName;

  final EcoData? eco;
  final PromotionData? promotion;

  final DateTime createdAt;
  final DateTime updatedAt;

  ProductData({
    required this.id,
    required this.shopId,
    required this.categoryId,
    required this.name,
    required this.slug,
    required this.description,
    required this.sku,
    required this.favoriteCount,
    required this.reviewCount,
    required this.ratingAverage,
    required this.ecoScore,
    required this.isActive,
    required this.price,
    required this.originalPrice,
    required this.finalPrice,
    required this.currency,
    required this.stock,
    required this.imageUrls,
    required this.categoryName,
    required this.shopName,
    this.eco,
    this.promotion,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ProductData.fromJson(Map<String, dynamic> json) {
    return ProductData(
      id: json['id'] ?? '',
      shopId: json['shopId'] ?? '',
      categoryId: json['categoryId'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'] ?? '',
      sku: json['sku'] ?? '',
      favoriteCount: json['favoriteCount'] ?? 0,
      reviewCount: json['reviewCount'] ?? 0,
      ratingAverage: (json['ratingAverage'] ?? 0).toDouble(),
      ecoScore: (json['ecoScore'] as num?)?.toDouble() ?? 0,
      isActive: json['isActive'] ?? false,
      price: (json['price'] as num?)?.toInt() ?? 0,
      originalPrice: (json['originalPrice'] as num?)?.toInt() ?? (json['price'] as num?)?.toInt() ?? 0,
      finalPrice: (json['finalPrice'] as num?)?.toInt() ?? (json['price'] as num?)?.toInt() ?? 0,
      currency: json['currency'] ?? '',
      stock: json['stock'] ?? 0,
      imageUrls: List<String>.from(json['imageUrls'] ?? []),
      categoryName: json['categoryName'] ?? '',
      shopName: json['shopName'] ?? '',
      eco: json['eco'] != null ? EcoData.fromJson(json['eco']) : null,
      promotion: json['promotion'] != null ? PromotionData.fromJson(json['promotion']) : null,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : DateTime.now(),
    );
  }

  ProductCardData toProductCardData({ProductCardVariant variant = ProductCardVariant.grid}) {
    return ProductCardData(
      productId: id,
      slug: slug,
      name: name,
      imageUrl: imageUrls.isNotEmpty ? imageUrls.first : null,
      price: finalPrice > 0 ? finalPrice : price,
      originalPrice: originalPrice > finalPrice ? originalPrice : null,
      finalPrice: finalPrice,
      discountPercent: promotion?.discountPercent.toInt(),
      discountAmount: promotion?.discountAmount.toInt(),
      savingLabel: promotion?.savingLabel,
      rating: ratingAverage,
      reviewCount: reviewCount,
      favoriteCount: favoriteCount,
      stock: stock,
      ecoScore: ecoScore > 0 ? ecoScore : eco?.score,
      ecoLabel: eco?.label,
      materialType: eco?.materialType,
      materialLabel: eco?.materialLabel,
      recyclable: eco?.recyclable,
      carbonFootprint: eco?.carbonFootprint,
      carbonLabel: eco?.carbonLabel,
      ecoBadges: eco?.badges,
      ecoReasons: eco?.reasons,
      shopName: shopName,
      categoryName: categoryName,
      hasPromo: promotion?.hasPromo ?? false,
      promotionCode: promotion?.code,
      promotionLabel: promotion?.label,
      variant: variant,
    );
  }
}

class EcoData {
  final double score;
  final String label;
  final String materialType;
  final String materialLabel;
  final bool recyclable;
  final double carbonFootprint;
  final String carbonLabel;
  final List<String> badges;
  final List<String> reasons;

  EcoData({
    required this.score,
    required this.label,
    required this.materialType,
    required this.materialLabel,
    required this.recyclable,
    required this.carbonFootprint,
    required this.carbonLabel,
    required this.badges,
    required this.reasons,
  });

  factory EcoData.fromJson(Map<String, dynamic> json) {
    return EcoData(
      score: (json['score'] as num?)?.toDouble() ?? 0.0,
      label: json['label'] ?? '',
      materialType: json['materialType'] ?? '',
      materialLabel: json['materialLabel'] ?? '',
      recyclable: json['recyclable'] ?? false,
      carbonFootprint: (json['carbonFootprint'] as num?)?.toDouble() ?? 0.0,
      carbonLabel: json['carbonLabel'] ?? '',
      badges: List<String>.from(json['badges'] ?? []),
      reasons: List<String>.from(json['reasons'] ?? []),
    );
  }
}

class PromotionData {
  final bool hasPromo;
  final String code;
  final String title;
  final String type;
  final double discountPercent;
  final double discountAmount;
  final String label;
  final String savingLabel;
  final DateTime? startsAt;
  final DateTime? endsAt;

  PromotionData({
    required this.hasPromo,
    required this.code,
    required this.title,
    required this.type,
    required this.discountPercent,
    required this.discountAmount,
    required this.label,
    required this.savingLabel,
    this.startsAt,
    this.endsAt,
  });

  factory PromotionData.fromJson(Map<String, dynamic> json) {
    return PromotionData(
      hasPromo: json['hasPromo'] ?? false,
      code: json['code'] ?? '',
      title: json['title'] ?? '',
      type: json['type'] ?? '',
      discountPercent: (json['discountPercent'] as num?)?.toDouble() ?? 0.0,
      discountAmount: (json['discountAmount'] as num?)?.toDouble() ?? 0.0,
      label: json['label'] ?? '',
      savingLabel: json['savingLabel'] ?? '',
      startsAt: json['startsAt'] != null ? DateTime.parse(json['startsAt']) : null,
      endsAt: json['endsAt'] != null ? DateTime.parse(json['endsAt']) : null,
    );
  }
}
