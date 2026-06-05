import 'package:equatable/equatable.dart';

class SearchProductResult extends Equatable {
  final String id;
  final String name;
  final String? slug;
  final double? price;
  final String? currency;
  final String? imageUrl;
  final double? ecoScore;
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
    this.currency,
    this.imageUrl,
    this.ecoScore,
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
    final imageUrls =
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
      currency: json['currency']?.toString(),
      imageUrl: imageUrl,
      ecoScore: (json['eco_score'] as num?)?.toDouble(),
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
    final imageUrls = json['imageUrls'];
    return SearchProductResult(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString(),
      price: (json['price'] as num?)?.toDouble(),
      currency: json['currency']?.toString(),
      imageUrl: imageUrls is List && imageUrls.isNotEmpty
          ? imageUrls.first.toString()
          : null,
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
