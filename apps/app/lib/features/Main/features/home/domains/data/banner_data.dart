import 'promotion_data.dart';

class BannerData {
  final String id;
  final String title;
  final String description;
  final String imageUrl;
  final String link;
  final String? promotionId;
  final bool isActive;
  final int position;
  final DateTime startDate;
  final DateTime endDate;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;
  final String type;
  final PromotionData? promotion;

  BannerData({
    required this.id,
    required this.title,
    required this.description,
    required this.imageUrl,
    required this.link,
    this.promotionId,
    required this.isActive,
    required this.position,
    required this.startDate,
    required this.endDate,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    required this.type,
    this.promotion,
  });

  factory BannerData.fromJson(Map<String, dynamic> json) {
    return BannerData(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      link: json['link'] ?? '',
      promotionId: json['promotionId'],
      isActive: json['isActive'] ?? false,
      position: json['position'] ?? 0,
      startDate: DateTime.parse(json['startDate']),
      endDate: DateTime.parse(json['endDate']),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      deletedAt: json['deletedAt'] != null
          ? DateTime.parse(json['deletedAt'])
          : null,
      type: json['type'] ?? '',
      promotion: json['promotion'] != null
          ? PromotionData.fromJson(json['promotion'])
          : null,
    );
  }
}