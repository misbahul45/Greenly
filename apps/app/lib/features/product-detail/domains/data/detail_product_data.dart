class DetailProductData {
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

  DetailProductData({
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

  factory DetailProductData.fromJson(Map<String, dynamic> json) {
    return DetailProductData(
      id: json['id'],
      shopId: json['shopId'],
      categoryId: json['categoryId'],
      name: json['name'],
      slug: json['slug'],
      description: json['description'],
      sku: json['sku'],
      favoriteCount: json['favoriteCount'],
      reviewCount: json['reviewCount'],
      ratingAverage: (json['ratingAverage'] as num).toDouble(),
      isActive: json['isActive'],
      price: json['price'],
      currency: json['currency'],
      stock: json['stock'],
      imageUrls: List<String>.from(json['imageUrls']),
      categoryName: json['categoryName'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'shopId': shopId,
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