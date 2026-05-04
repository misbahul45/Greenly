class PromotionData {
  final String id;
  final String code;
  final String name;

  PromotionData({
    required this.id,
    required this.code,
    required this.name,
  });

  factory PromotionData.fromJson(Map<String, dynamic> json) {
    return PromotionData(
      id: json['id'] ?? '',
      code: json['code'] ?? '',
      name: json['name'] ?? '',
    );
  }
}