class ToggleFavoriteData {
  final bool isFavorite;
  final String productId;

  const ToggleFavoriteData({required this.isFavorite, required this.productId});

  factory ToggleFavoriteData.fromJson(Map<String, dynamic> json) {
    return ToggleFavoriteData(
      isFavorite: json['isFavorite'] ?? false,
      productId: json['productId'] ?? '',
    );
  }
}

class CheckFavoriteData {
  final bool isFavorite;
  final String productId;

  const CheckFavoriteData({required this.isFavorite, required this.productId});

  factory CheckFavoriteData.fromJson(Map<String, dynamic> json) {
    return CheckFavoriteData(
      isFavorite: json['isFavorite'] ?? false,
      productId: json['productId'] ?? '',
    );
  }
}

class FavoriteItemData {
  final String id;
  final String userId;
  final String productId;
  final String shopId;
  final DateTime createdAt;
  final String name;
  final String slug;
  final String imageUrl;
  final int price;
  final String currency;
  final int stock;
  final String categoryName;
  final String shopName;
  final double ratingAverage;
  final int reviewCount;
  final int favoriteCount;

  const FavoriteItemData({
    required this.id,
    required this.userId,
    required this.productId,
    required this.shopId,
    required this.createdAt,
    this.name = '',
    this.slug = '',
    this.imageUrl = '',
    this.price = 0,
    this.currency = 'IDR',
    this.stock = 0,
    this.categoryName = '',
    this.shopName = '',
    this.ratingAverage = 0,
    this.reviewCount = 0,
    this.favoriteCount = 0,
  });

  factory FavoriteItemData.fromJson(Map<String, dynamic> json) {
    final product = json['product'] as Map<String, dynamic>? ?? {};
    return FavoriteItemData(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      productId: json['productId']?.toString() ?? '',
      shopId: json['shopId']?.toString() ?? '',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
      name: product['name']?.toString() ?? '',
      slug: product['slug']?.toString() ?? '',
      imageUrl: product['imageUrl']?.toString() ?? '',
      price: (product['price'] as num?)?.toInt() ?? 0,
      currency: product['currency']?.toString() ?? 'IDR',
      stock: (product['stock'] as num?)?.toInt() ?? 0,
      categoryName: product['categoryName']?.toString() ?? '',
      shopName: product['shopName']?.toString() ?? '',
      ratingAverage: (product['ratingAverage'] as num?)?.toDouble() ?? 0,
      reviewCount: (product['reviewCount'] as num?)?.toInt() ?? 0,
      favoriteCount: (product['favoriteCount'] as num?)?.toInt() ?? 0,
    );
  }
}

class FavoriteListData {
  final List<FavoriteItemData> favorites;

  const FavoriteListData({required this.favorites});

  factory FavoriteListData.fromJson(Map<String, dynamic> json) {
    return FavoriteListData(
      favorites: (json['favorites'] as List<dynamic>? ?? [])
          .map((e) => FavoriteItemData.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class FavoriteProductData {
  final String favoriteId;
  final String productId;
  final String shopId;
  final String name;
  final String slug;
  final String imageUrl;
  final int price;
  final String currency;
  final double ratingAverage;
  final int reviewCount;
  final int stock;
  final String categoryName;
  final String shopName;
  final int favoriteCount;

  const FavoriteProductData({
    required this.favoriteId,
    required this.productId,
    required this.shopId,
    required this.name,
    required this.slug,
    required this.imageUrl,
    required this.price,
    required this.currency,
    required this.ratingAverage,
    required this.reviewCount,
    required this.stock,
    this.categoryName = '',
    this.shopName = '',
    this.favoriteCount = 0,
  });
}
