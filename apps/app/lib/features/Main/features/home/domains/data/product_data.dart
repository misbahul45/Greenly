import 'package:app/core/utils/safe_json.dart';
import 'package:app/features/Main/features/home/domains/data/promotion_data.dart';
import 'package:app/shared/widgets/product/product_card_data.dart';

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

  /// Returns a safe empty/default ProductData.
  factory ProductData.empty() {
    final epoch = DateTime.fromMillisecondsSinceEpoch(0);
    return ProductData(
      id: '',
      shopId: '',
      categoryId: '',
      name: '',
      slug: '',
      description: '',
      sku: '',
      favoriteCount: 0,
      reviewCount: 0,
      ratingAverage: 0.0,
      ecoScore: 0.0,
      isActive: false,
      price: 0,
      originalPrice: 0,
      finalPrice: 0,
      currency: '',
      stock: 0,
      imageUrls: [],
      categoryName: '',
      shopName: '',
      createdAt: epoch,
      updatedAt: epoch,
    );
  }

  factory ProductData.fromJson(Map<String, dynamic> json) {
    // imageUrls: accept both array field and single-image fields
    List<String> imageUrls = SafeJson.readStringList(
      json,
      ['imageUrls', 'image_urls', 'images'],
    );
    if (imageUrls.isEmpty) {
      final single = SafeJson.readString(
        json,
        ['imageUrl', 'image_url', 'image', 'url', 'thumbnail'],
      );
      if (single.isNotEmpty) imageUrls = [single];
    }

    // EcoData — only parse when it's a valid non-empty Map
    EcoData? eco;
    final rawEco = json['eco'] ?? json['ecoAttributes'];
    if (rawEco is Map) {
      try {
        final ecoMap = rawEco is Map<String, dynamic>
            ? rawEco
            : rawEco.cast<String, dynamic>();
        if (ecoMap.isNotEmpty) {
          eco = EcoData.fromJson(ecoMap);
        }
      } catch (_) {
        eco = null;
      }
    }

    // PromotionData — only parse when it's a valid non-empty Map
    PromotionData? promotion;
    final rawPromotion = json['promotion'];
    if (rawPromotion is Map) {
      try {
        final promoMap = rawPromotion is Map<String, dynamic>
            ? rawPromotion
            : rawPromotion.cast<String, dynamic>();
        if (promoMap.isNotEmpty) {
          promotion = PromotionData.fromJson(promoMap);
        }
      } catch (_) {
        promotion = null;
      }
    }

    final price = SafeJson.readInt(json, ['price']);
    final originalPrice = SafeJson.readInt(
      json,
      ['originalPrice', 'original_price'],
      fallback: price,
    );
    final finalPrice = SafeJson.readInt(
      json,
      ['finalPrice', 'final_price'],
      fallback: price,
    );

    return ProductData(
      id: SafeJson.readString(json, ['id']),
      shopId: SafeJson.readString(json, ['shopId', 'shop_id']),
      categoryId: SafeJson.readString(json, ['categoryId', 'category_id']),
      name: SafeJson.readString(json, ['name']),
      slug: SafeJson.readString(json, ['slug']),
      description: SafeJson.readString(json, ['description']),
      sku: SafeJson.readString(json, ['sku']),
      favoriteCount: SafeJson.readInt(json, ['favoriteCount', 'favorite_count']),
      reviewCount: SafeJson.readInt(json, ['reviewCount', 'review_count']),
      ratingAverage: SafeJson.readDouble(json, ['ratingAverage', 'rating_average']),
      ecoScore: SafeJson.readDouble(json, ['ecoScore', 'eco_score']),
      isActive: SafeJson.readBool(json, ['isActive', 'is_active'], fallback: true),
      price: price,
      originalPrice: originalPrice,
      finalPrice: finalPrice,
      currency: SafeJson.readString(json, ['currency']),
      stock: SafeJson.readInt(json, ['stock']),
      imageUrls: imageUrls,
      categoryName: SafeJson.readString(json, ['categoryName', 'category_name']),
      shopName: SafeJson.readString(json, ['shopName', 'shop_name']),
      eco: eco,
      promotion: promotion,
      createdAt: SafeJson.readDateTime(json, ['createdAt', 'created_at']),
      updatedAt: SafeJson.readDateTime(json, ['updatedAt', 'updated_at']),
    );
  }

  ProductCardData toProductCardData({
    ProductCardVariant variant = ProductCardVariant.grid,
  }) {
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
      score: SafeJson.readDouble(json, ['score']),
      label: SafeJson.readString(json, ['label']),
      materialType: SafeJson.readString(json, ['materialType', 'material_type']),
      materialLabel: SafeJson.readString(json, ['materialLabel', 'material_label']),
      recyclable: SafeJson.readBool(json, ['recyclable']),
      carbonFootprint: SafeJson.readDouble(json, ['carbonFootprint', 'carbon_footprint']),
      carbonLabel: SafeJson.readString(json, ['carbonLabel', 'carbon_label']),
      badges: SafeJson.readStringList(json, ['badges']),
      reasons: SafeJson.readStringList(json, ['reasons']),
    );
  }
}
