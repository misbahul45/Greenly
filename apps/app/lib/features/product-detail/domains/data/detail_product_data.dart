class DetailProductData {
  final String id;
  final String shopId;
  final String shopName;
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

  DetailProductData({
    required this.id,
    required this.shopId,
    required this.shopName,
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

  factory DetailProductData.fromJson(Map<String, dynamic> json) {
    return DetailProductData(
      id: json['id']?.toString() ?? '',
      shopId: json['shopId']?.toString() ?? '',
      shopName: json['shopName']?.toString() ?? '',
      categoryId: json['categoryId']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      sku: json['sku']?.toString() ?? '',
      favoriteCount: json['favoriteCount'] is int
          ? json['favoriteCount'] as int
          : int.tryParse('${json['favoriteCount']}') ?? 0,
      reviewCount: json['reviewCount'] is int
          ? json['reviewCount'] as int
          : int.tryParse('${json['reviewCount']}') ?? 0,
      ratingAverage: (json['ratingAverage'] as num?)?.toDouble() ?? 0.0,
      isActive: json['isActive'] as bool? ?? false,
      price: json['price'] is int
          ? json['price'] as int
          : int.tryParse('${json['price']}') ?? 0,
      currency: json['currency']?.toString() ?? 'IDR',
      stock: json['stock'] is int
          ? json['stock'] as int
          : int.tryParse('${json['stock']}') ?? 0,
      imageUrls: json['imageUrls'] is List
          ? List<String>.from(json['imageUrls'] as List)
          : const [],
      categoryName: json['categoryName']?.toString() ?? '',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
          DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt']?.toString() ?? '') ??
          DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'shopId': shopId,
      'shopName': shopName,
      'categoryId': categoryId,
      'name': name,
      'slug': slug,
      'description': description,
      'sku': sku,
      'favoriteCount': favoriteCount,
      'reviewCount': reviewCount,
      'ratingAverage': ratingAverage,
      'isActive': isActive,
      'price': price,
      'currency': currency,
      'stock': stock,
      'imageUrls': imageUrls,
      'categoryName': categoryName,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}