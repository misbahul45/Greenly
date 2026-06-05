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
  });

  factory SearchProductResult.fromMl(Map<String, dynamic> json) {
    return SearchProductResult(
      id: json['product_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString(),
      price: (json['price'] as num?)?.toDouble(),
      currency: json['currency']?.toString(),
      imageUrl: json['image_url']?.toString(),
      ecoScore: (json['eco_score'] as num?)?.toDouble(),
      reason: json['reason']?.toString(),
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
    );
  }

  @override
  List<Object?> get props => [id, name, slug, price, currency, imageUrl, ecoScore, reason, fromFallback];
}
