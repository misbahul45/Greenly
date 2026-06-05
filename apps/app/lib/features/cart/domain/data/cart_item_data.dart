class CartItemData {
  final String id;
  final String productId;
  final int quantity;
  final DateTime createdAt;
  final String? productName;
  final String? productImageUrl;
  final int? productPrice;
  final String? shopId;
  final String? shopName;

  const CartItemData({
    required this.id,
    required this.productId,
    required this.quantity,
    required this.createdAt,
    this.productName,
    this.productImageUrl,
    this.productPrice,
    this.shopId,
    this.shopName,
  });

  factory CartItemData.fromJson(Map<String, dynamic> json) {
    return CartItemData(
      id: json['id'] ?? '',
      productId: json['productId'] ?? '',
      quantity: json['quantity'] ?? 0,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }

  int get lineTotal => (productPrice ?? 0) * quantity;

  CartItemData copyWith({
    String? productName,
    String? productImageUrl,
    int? productPrice,
    int? quantity,
    String? shopId,
    String? shopName,
  }) {
    return CartItemData(
      id: id,
      productId: productId,
      quantity: quantity ?? this.quantity,
      createdAt: createdAt,
      productName: productName ?? this.productName,
      productImageUrl: productImageUrl ?? this.productImageUrl,
      productPrice: productPrice ?? this.productPrice,
      shopId: shopId ?? this.shopId,
      shopName: shopName ?? this.shopName,
    );
  }
}

class CartShopGroup {
  final String shopId;
  final String shopName;
  final List<CartItemData> items;

  const CartShopGroup({
    required this.shopId,
    required this.shopName,
    required this.items,
  });

  int get subtotal => items.fold(0, (sum, item) => sum + item.lineTotal);
  int get totalQuantity => items.fold(0, (sum, item) => sum + item.quantity);
  List<String> get productIds => items.map((e) => e.productId).toList();
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

  List<CartShopGroup> get groupedByShop {
    final map = <String, List<CartItemData>>{};
    for (final item in items) {
      final key = item.shopId ?? '';
      map.putIfAbsent(key, () => []).add(item);
    }
    return map.entries.map((entry) {
      final first = entry.value.first;
      return CartShopGroup(
        shopId: entry.key,
        shopName: first.shopName?.isNotEmpty == true ? first.shopName! : 'Toko',
        items: entry.value,
      );
    }).toList();
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
