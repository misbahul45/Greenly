class CartItemData {
  final String id;
  final String productId;
  final int quantity;
  final DateTime createdAt;
  final String? productName;
  final String? productImageUrl;
  final int? productPrice;

  const CartItemData({
    required this.id,
    required this.productId,
    required this.quantity,
    required this.createdAt,
    this.productName,
    this.productImageUrl,
    this.productPrice,
  });

  factory CartItemData.fromJson(Map<String, dynamic> json) {
    return CartItemData(
      id: json['id'] ?? '',
      productId: json['productId'] ?? '',
      quantity: json['quantity'] ?? 0,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }

  CartItemData copyWith({
    String? productName,
    String? productImageUrl,
    int? productPrice,
    int? quantity,
  }) {
    return CartItemData(
      id: id,
      productId: productId,
      quantity: quantity ?? this.quantity,
      createdAt: createdAt,
      productName: productName ?? this.productName,
      productImageUrl: productImageUrl ?? this.productImageUrl,
      productPrice: productPrice ?? this.productPrice,
    );
  }
}

class CartData {
  final String? id;
  final String userId;
  final List<CartItemData> items;
  final int totalItems;

  const CartData({
    this.id,
    required this.userId,
    required this.items,
    required this.totalItems,
  });

  factory CartData.fromJson(Map<String, dynamic> json) {
    return CartData(
      id: json['id'],
      userId: json['userId'] ?? '',
      items: (json['items'] as List<dynamic>? ?? [])
          .map((e) => CartItemData.fromJson(e))
          .toList(),
      totalItems: json['totalItems'] ?? 0,
    );
  }

  CartData copyWith({List<CartItemData>? items}) {
    return CartData(
      id: id,
      userId: userId,
      items: items ?? this.items,
      totalItems: items?.length ?? totalItems,
    );
  }
}
