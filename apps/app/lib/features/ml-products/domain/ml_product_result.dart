import 'package:equatable/equatable.dart';

class MlProductResult extends Equatable {
  final String id;
  final String productId;
  final double score;
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

  final double? ratingAverage;
  final int? reviewCount;
  final int? favoriteCount;
  final int? stock;
  final String? categoryName;
  final String? shopName;
  final String reason;

  const MlProductResult({
    required this.id,
    required this.productId,
    required this.score,
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
    this.ratingAverage,
    this.reviewCount,
    this.favoriteCount,
    this.stock,
    this.categoryName,
    this.shopName,
    required this.reason,
  });

  factory MlProductResult.fromJson(Map<String, dynamic> json) {
    final id = (json['product_id'] ?? json['id'] ?? '') as String;

    final rawUrls = json['image_urls'] ?? json['imageUrls'];
    final List<String> imageUrls =
        rawUrls is List ? rawUrls.whereType<String>().toList() : const [];

    final String? imageUrl =
        json['image_url'] as String? ??
        json['imageUrl'] as String? ??
        (imageUrls.isNotEmpty ? imageUrls.first : null);

    return MlProductResult(
      id: id,
      productId: id,
      score: _d(json['score']) ?? 0.0,
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String?,
      price: _d(json['price']),
      originalPrice: _d(json['original_price'] ?? json['originalPrice']),
      finalPrice: _d(json['final_price'] ?? json['finalPrice']),
      currency: json['currency'] as String?,
      imageUrl: imageUrl,
      imageUrls: imageUrls,
      
      // Eco
      ecoScore: _d(json['eco_score'] ?? json['ecoScore']),
      ecoLabel: json['eco_label'] as String? ?? json['ecoLabel'] as String?,
      materialType: json['material_type'] as String? ?? json['materialType'] as String?,
      materialLabel: json['material_label'] as String? ?? json['materialLabel'] as String?,
      recyclable: json['recyclable'] as bool?,
      carbonFootprint: _d(json['carbon_footprint'] ?? json['carbonFootprint']),
      carbonLabel: json['carbon_label'] as String? ?? json['carbonLabel'] as String?,
      ecoBadges: List<String>.from(json['eco_badges'] ?? json['ecoBadges'] ?? []),
      ecoReasons: List<String>.from(json['eco_reasons'] ?? json['ecoReasons'] ?? []),
      
      // Promo
      hasPromo: json['has_promo'] as bool? ?? json['hasPromo'] as bool? ?? false,
      promotionCode: json['promotion_code'] as String? ?? json['promotionCode'] as String?,
      promotionLabel: json['promotion_label'] as String? ?? json['promotionLabel'] as String?,
      discountPercent: _d(json['discount_percent'] ?? json['discountPercent']),
      discountAmount: _d(json['discount_amount'] ?? json['discountAmount']),
      savingLabel: json['saving_label'] as String? ?? json['savingLabel'] as String?,
      
      ratingAverage: _d(json['rating_average'] ?? json['ratingAverage']),
      reviewCount: _i(json['review_count'] ?? json['reviewCount']),
      favoriteCount: _i(json['favorite_count'] ?? json['favoriteCount']),
      stock: _i(json['stock']),
      categoryName: json['category_name'] as String? ?? json['categoryName'] as String?,
      shopName: json['shop_name'] as String? ?? json['shopName'] as String?,
      reason: json['reason'] as String? ?? '',
    );
  }

  static double? _d(dynamic v) => v == null ? null : (v as num).toDouble();
  static int? _i(dynamic v) => v == null ? null : (v as num).toInt();

  @override
  List<Object?> get props => [id];
}
