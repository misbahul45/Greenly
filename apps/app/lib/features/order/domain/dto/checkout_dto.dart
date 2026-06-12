class CheckoutDto {
  final String shopId;
  final String shopName;
  final List<String> itemIds;
  final String paymentMethod;
  final String? promoCode;
  final String? shippingAddress;
  final List<CheckoutItemSnapshotDto> items;

  CheckoutDto({
    required this.shopId,
    required this.shopName,
    required this.itemIds,
    required this.paymentMethod,
    this.promoCode,
    this.shippingAddress,
    this.items = const [],
  });

  Map<String, dynamic> toJson() => {
    "shopId": shopId,
    "shopName": shopName,
    "itemIds": itemIds,
    "paymentMethod": paymentMethod,
    if (promoCode != null && promoCode!.isNotEmpty) "promoCode": promoCode,
    if (shippingAddress != null && shippingAddress!.isNotEmpty)
      "shippingAddress": shippingAddress,
    if (items.isNotEmpty) "items": items.map((e) => e.toJson()).toList(),
  };
}

class CheckoutItemSnapshotDto {
  final String productId;
  final String productName;
  final int price;
  final int quantity;

  const CheckoutItemSnapshotDto({
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
  });

  Map<String, dynamic> toJson() => {
    "productId": productId,
    "productName": productName,
    "price": price,
    "quantity": quantity,
  };
}

class CheckoutResultData {
  final String orderId;
  final String paymentId;
  final String provider;
  final int totalAmount;
  final int discount;
  final int itemsCount;
  final String status;
  final String? paymentUrl;
  final String? checkoutSessionId;
  final String? clientSecret;

  const CheckoutResultData({
    required this.orderId,
    this.paymentId = '',
    this.provider = '',
    required this.totalAmount,
    required this.discount,
    required this.itemsCount,
    required this.status,
    this.paymentUrl,
    this.checkoutSessionId,
    this.clientSecret,
  });

  factory CheckoutResultData.fromJson(Map<String, dynamic> json) {
    int toInt(dynamic v) =>
        v is int ? v : (v is num ? v.toInt() : int.tryParse('$v') ?? 0);
    return CheckoutResultData(
      orderId: json['orderId']?.toString() ?? '',
      paymentId: json['paymentId']?.toString() ?? '',
      provider: json['provider']?.toString() ?? '',
      totalAmount: toInt(json['totalAmount']),
      discount: toInt(json['discount']),
      itemsCount: toInt(json['itemsCount']),
      status: json['status']?.toString() ?? 'PENDING',
      paymentUrl: json['paymentUrl']?.toString(),
      checkoutSessionId: json['checkoutSessionId']?.toString(),
      clientSecret: json['clientSecret']?.toString(),
    );
  }
}
