int _toInt(dynamic value) {
  if (value == null) return 0;
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse(value.toString()) ??
      num.tryParse(value.toString())?.toInt() ??
      0;
}

class OrderItemData {
  final String id;
  final String productId;
  final String productName;
  final String? productImageUrl;
  final int price;
  final int quantity;

  const OrderItemData({
    required this.id,
    required this.productId,
    required this.productName,
    this.productImageUrl,
    required this.price,
    required this.quantity,
  });

  factory OrderItemData.fromJson(Map<String, dynamic> json) {
    return OrderItemData(
      id: json['id']?.toString() ?? '',
      productId: json['productId']?.toString() ?? '',
      productName: json['productName']?.toString() ?? '',
      productImageUrl: json['productImageUrl']?.toString(),
      price: _toInt(json['price']),
      quantity: _toInt(json['quantity']),
    );
  }
}

class OrderPaymentData {
  final String id;
  final String status;
  final String method;
  final String provider;
  final int grossAmount;
  final int netAmount;
  final String? paymentUrl;
  final String? checkoutSessionId;
  final String? stripePaymentIntentId;
  final DateTime? paidAt;

  const OrderPaymentData({
    required this.id,
    required this.status,
    required this.method,
    this.provider = '',
    required this.grossAmount,
    required this.netAmount,
    this.paymentUrl,
    this.checkoutSessionId,
    this.stripePaymentIntentId,
    this.paidAt,
  });

  factory OrderPaymentData.fromJson(Map<String, dynamic> json) {
    return OrderPaymentData(
      id: json['id']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      method: json['method']?.toString() ?? '',
      provider:
          json['provider']?.toString() ?? json['method']?.toString() ?? '',
      grossAmount: _toInt(json['grossAmount']),
      netAmount: _toInt(json['netAmount']),
      paymentUrl: json['paymentUrl']?.toString(),
      checkoutSessionId: json['checkoutSessionId']?.toString(),
      stripePaymentIntentId: json['stripePaymentIntentId']?.toString(),
      paidAt: json['paidAt'] != null
          ? DateTime.tryParse(json['paidAt'].toString())
          : null,
    );
  }
}

class OrderData {
  final String id;
  final String shopId;
  final String shopName;
  final int totalAmount;
  final String status;
  final DateTime createdAt;
  final List<OrderItemData> items;
  final OrderPaymentData? payment;

  const OrderData({
    required this.id,
    required this.shopId,
    required this.shopName,
    required this.totalAmount,
    required this.status,
    required this.createdAt,
    required this.items,
    this.payment,
  });

  int get totalQuantity => items.fold(0, (sum, item) => sum + item.quantity);

  factory OrderData.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'];
    final rawPayment = json['payment'];

    return OrderData(
      id: json['id']?.toString() ?? '',
      shopId: json['shopId']?.toString() ?? '',
      shopName: json['shopName']?.toString() ?? '',
      totalAmount: _toInt(json['totalAmount']),
      status: json['status']?.toString() ?? 'PENDING',
      createdAt:
          DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
          DateTime.now(),
      items: rawItems is List
          ? rawItems
                .whereType<Map<String, dynamic>>()
                .map(OrderItemData.fromJson)
                .toList()
          : const [],
      payment: rawPayment is Map<String, dynamic>
          ? OrderPaymentData.fromJson(rawPayment)
          : null,
    );
  }

  static List<OrderData> listFromJson(dynamic json) {
    final items = json is List ? json : const [];
    return items
        .whereType<Map<String, dynamic>>()
        .map(OrderData.fromJson)
        .toList();
  }
}
