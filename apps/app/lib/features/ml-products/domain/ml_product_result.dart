import 'package:equatable/equatable.dart';

class MlProductResult extends Equatable {
  final String id;
  final String productId;
  final double score;
  final String name;
  final String? slug;
  final double? price;
  final String? currency;
  final String? imageUrl;
  final List<String> imageUrls;
  final double? ecoScore;
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
    this.currency,
    this.imageUrl,
    this.imageUrls = const [],
    this.ecoScore,
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
      currency: json['currency'] as String?,
      imageUrl: imageUrl,
      imageUrls: imageUrls,
      ecoScore: _d(json['eco_score'] ?? json['ecoScore']),
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
