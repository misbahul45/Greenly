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

  const FavoriteItemData({
    required this.id,
    required this.userId,
    required this.productId,
    required this.shopId,
    required this.createdAt,
  });

  factory FavoriteItemData.fromJson(Map<String, dynamic> json) {
    return FavoriteItemData(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      productId: json['productId'] ?? '',
      shopId: json['shopId'] ?? '',
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}

class FavoriteListData {
  final List<FavoriteItemData> favorites;

  const FavoriteListData({required this.favorites});

  factory FavoriteListData.fromJson(Map<String, dynamic> json) {
    return FavoriteListData(
      favorites: (json['favorites'] as List<dynamic>? ?? [])
          .map((e) => FavoriteItemData.fromJson(e))
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
  });
}
