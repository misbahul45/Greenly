class CheckoutDto {
  final String shopId;
  final String shopName;
  final List<String> itemIds;
  final String paymentMethod;
  final String? promoCode;

  CheckoutDto({
    required this.shopId,
    required this.shopName,
    required this.itemIds,
    required this.paymentMethod,
    this.promoCode,
  });

  Map<String, dynamic> toJson() => {
    "shopId": shopId,
    "shopName": shopName,
    "itemIds": itemIds,
    "paymentMethod": paymentMethod,
    if (promoCode != null && promoCode!.isNotEmpty) "promoCode": promoCode,
  };
}

class CheckoutResultData {
  final String orderId;
  final int totalAmount;
  final int discount;
  final int itemsCount;
  final String status;

  const CheckoutResultData({
    required this.orderId,
    required this.totalAmount,
    required this.discount,
    required this.itemsCount,
    required this.status,
  });

  factory CheckoutResultData.fromJson(Map<String, dynamic> json) {
    int toInt(dynamic v) =>
        v is int ? v : (v is num ? v.toInt() : int.tryParse('$v') ?? 0);
    return CheckoutResultData(
      orderId: json['orderId']?.toString() ?? '',
      totalAmount: toInt(json['totalAmount']),
      discount: toInt(json['discount']),
      itemsCount: toInt(json['itemsCount']),
      status: json['status']?.toString() ?? 'PENDING',
    );
  }
}
