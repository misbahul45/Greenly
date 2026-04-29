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

  final bool isActive;

  final int price;
  final String currency;
  final int stock;

  final List<String> imageUrls;

  final String categoryName;

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
    required this.isActive,
    required this.price,
    required this.currency,
    required this.stock,
    required this.imageUrls,
    required this.categoryName,
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
      isActive: json['isActive'] ?? false,
      price: json['price'] ?? 0,
      currency: json['currency'] ?? '',
      stock: json['stock'] ?? 0,
      imageUrls: List<String>.from(json['imageUrls'] ?? []),
      categoryName: json['categoryName'] ?? '',
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}