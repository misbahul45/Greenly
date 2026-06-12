import 'package:equatable/equatable.dart';

class SearchProductResult extends Equatable {
  final String id;
  final String name;
  final String? slug;
  final double? price;
  final double? originalPrice;
  final double? finalPrice;
  final String? currency;
  final String? imageUrl;
  final List<String> imageUrls;
  
  // Eco
  final double? ecoScore;
  final String? ecoLabel;
  final String? materialType;
  final String? materialLabel;
  final bool? recyclable;
  final double? carbonFootprint;
  final String? carbonLabel;
  final List<String> ecoBadges;
  final List<String> ecoReasons;
  
  // Promo
  final bool hasPromo;
  final String? promotionCode;
  final String? promotionLabel;
  final double? discountPercent;
  final double? discountAmount;
  final String? savingLabel;

  final String? reason;
  final bool fromFallback;
  final double? rating;
  final int? reviewCount;
  final int? stock;
  final int? favoriteCount;
  final bool isFavorite;
  final String? categoryName;
  final String? shopName;

  const SearchProductResult({
    required this.id,
    required this.name,
    this.slug,
    this.price,
    this.originalPrice,
    this.finalPrice,
    this.currency,
    this.imageUrl,
    this.imageUrls = const [],
    this.ecoScore,
    this.ecoLabel,
    this.materialType,
    this.materialLabel,
    this.recyclable,
    this.carbonFootprint,
    this.carbonLabel,
    this.ecoBadges = const [],
    this.ecoReasons = const [],
    this.hasPromo = false,
    this.promotionCode,
    this.promotionLabel,
    this.discountPercent,
    this.discountAmount,
    this.savingLabel,
    this.reason,
    this.fromFallback = false,
    this.rating,
    this.reviewCount,
    this.stock,
    this.favoriteCount,
    this.isFavorite = false,
    this.categoryName,
    this.shopName,
  });

  factory SearchProductResult.fromMl(Map<String, dynamic> json) {
    final rawUrls = json['image_urls'] ?? json['imageUrls'];
    final List<String> imageUrls =
        rawUrls is List ? rawUrls.whereType<String>().toList() : <String>[];
    final imageUrl =
        json['image_url']?.toString() ??
        json['imageUrl']?.toString() ??
        (imageUrls.isNotEmpty ? imageUrls.first : null);

    return SearchProductResult(
      id: json['product_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString(),
      price: (json['price'] as num?)?.toDouble(),
      originalPrice: (json['original_price'] as num? ?? json['originalPrice'] as num?)?.toDouble(),
      finalPrice: (json['final_price'] as num? ?? json['finalPrice'] as num?)?.toDouble(),
      currency: json['currency']?.toString(),
      imageUrl: imageUrl,
      imageUrls: imageUrls,
      
      // Eco
      ecoScore: (json['eco_score'] as num? ?? json['ecoScore'] as num?)?.toDouble(),
      ecoLabel: json['eco_label']?.toString() ?? json['ecoLabel']?.toString(),
      materialType: json['material_type']?.toString() ?? json['materialType']?.toString(),
      materialLabel: json['material_label']?.toString() ?? json['materialLabel']?.toString(),
      recyclable: json['recyclable'] as bool?,
      carbonFootprint: (json['carbon_footprint'] as num? ?? json['carbonFootprint'] as num?)?.toDouble(),
      carbonLabel: json['carbon_label']?.toString() ?? json['carbonLabel']?.toString(),
      ecoBadges: List<String>.from(json['eco_badges'] ?? json['ecoBadges'] ?? []),
      ecoReasons: List<String>.from(json['eco_reasons'] ?? json['ecoReasons'] ?? []),
      
      // Promo
      hasPromo: json['has_promo'] as bool? ?? json['hasPromo'] as bool? ?? false,
      promotionCode: json['promotion_code']?.toString() ?? json['promotionCode']?.toString(),
      promotionLabel: json['promotion_label']?.toString() ?? json['promotionLabel']?.toString(),
      discountPercent: (json['discount_percent'] as num? ?? json['discountPercent'] as num?)?.toDouble(),
      discountAmount: (json['discount_amount'] as num? ?? json['discountAmount'] as num?)?.toDouble(),
      savingLabel: json['saving_label']?.toString() ?? json['savingLabel']?.toString(),
      
      reason: json['reason']?.toString(),
      rating: (json['rating_average'] as num?)?.toDouble() ??
          (json['ratingAverage'] as num?)?.toDouble(),
      reviewCount: (json['review_count'] as num?)?.toInt() ??
          (json['reviewCount'] as num?)?.toInt(),
      favoriteCount: (json['favorite_count'] as num?)?.toInt() ??
          (json['favoriteCount'] as num?)?.toInt(),
      stock: (json['stock'] as num?)?.toInt(),
      categoryName: json['category_name']?.toString() ??
          json['categoryName']?.toString(),
      shopName:
          json['shop_name']?.toString() ?? json['shopName']?.toString(),
    );
  }

  factory SearchProductResult.fromCatalog(Map<String, dynamic> json) {
    final rawUrls = json['imageUrls'];
    final List<String> imageUrls =
        rawUrls is List ? rawUrls.whereType<String>().toList() : <String>[];
    
    final eco = json['eco'] as Map<String, dynamic>?;
    final promo = json['promotion'] as Map<String, dynamic>?;

    return SearchProductResult(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString(),
      price: (json['price'] as num?)?.toDouble(),
      originalPrice: (json['originalPrice'] as num?)?.toDouble(),
      finalPrice: (json['finalPrice'] as num?)?.toDouble(),
      currency: json['currency']?.toString(),
      imageUrl: imageUrls.isNotEmpty ? imageUrls.first : null,
      imageUrls: imageUrls,
      
      // Eco
      ecoScore: (json['ecoScore'] as num?)?.toDouble() ?? (eco?['score'] as num?)?.toDouble(),
      ecoLabel: eco?['label']?.toString(),
      materialType: eco?['materialType']?.toString(),
      materialLabel: eco?['materialLabel']?.toString(),
      recyclable: eco?['recyclable'] as bool?,
      carbonFootprint: (eco?['carbonFootprint'] as num?)?.toDouble(),
      carbonLabel: eco?['carbonLabel']?.toString(),
      ecoBadges: List<String>.from(eco?['badges'] ?? []),
      ecoReasons: List<String>.from(eco?['reasons'] ?? []),
      
      // Promo
      hasPromo: promo?['hasPromo'] as bool? ?? false,
      promotionCode: promo?['code']?.toString(),
      promotionLabel: promo?['label']?.toString(),
      discountPercent: (promo?['discountPercent'] as num?)?.toDouble(),
      discountAmount: (promo?['discountAmount'] as num?)?.toDouble(),
      savingLabel: promo?['savingLabel']?.toString(),
      
      reason: json['description']?.toString(),
      fromFallback: true,
      rating: (json['ratingAverage'] as num?)?.toDouble(),
      reviewCount: (json['reviewCount'] as num?)?.toInt(),
      favoriteCount: (json['favoriteCount'] as num?)?.toInt(),
      stock: (json['stock'] as num?)?.toInt(),
      categoryName: json['categoryName']?.toString(),
      shopName: json['shopName']?.toString(),
    );
  }

  @override
  List<Object?> get props => [
    id,
    name,
    slug,
    price,
    currency,
    imageUrl,
    ecoScore,
    reason,
    fromFallback,
    rating,
    reviewCount,
    stock,
    favoriteCount,
    isFavorite,
    categoryName,
    shopName,
  ];
}
