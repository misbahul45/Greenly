import 'package:Greenly/core/utils/safe_json.dart';
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

  /// Returns a safe empty/default BannerData.
  factory BannerData.empty() {
    final epoch = DateTime.fromMillisecondsSinceEpoch(0);
    return BannerData(
      id: '',
      title: '',
      description: '',
      imageUrl: '',
      link: '',
      isActive: false,
      position: 0,
      startDate: epoch,
      endDate: epoch,
      createdAt: epoch,
      updatedAt: epoch,
      type: '',
    );
  }

  factory BannerData.fromJson(Map<String, dynamic> json) {
    // imageUrl accepts several possible field names
    final imageUrl = SafeJson.readString(
      json,
      ['imageUrl', 'image_url', 'image', 'url', 'thumbnail'],
    );

    // promotion — only parse when it's a valid non-empty Map
    PromotionData? promotion;
    final rawPromotion = json['promotion'];
    if (rawPromotion is Map) {
      try {
        final promoMap = rawPromotion is Map<String, dynamic>
            ? rawPromotion
            : rawPromotion.cast<String, dynamic>();
        if (promoMap.isNotEmpty) {
          promotion = PromotionData.fromJson(promoMap);
        }
      } catch (_) {
        promotion = null;
      }
    }

    return BannerData(
      id: SafeJson.readString(json, ['id']),
      title: SafeJson.readString(json, ['title']),
      description: SafeJson.readString(json, ['description']),
      imageUrl: imageUrl,
      link: SafeJson.readString(json, ['link']),
      promotionId: json['promotionId'] as String?,
      isActive: SafeJson.readBool(json, ['isActive']),
      position: SafeJson.readInt(json, ['position']),
      startDate: SafeJson.readDateTime(json, ['startDate']),
      endDate: SafeJson.readDateTime(json, ['endDate']),
      createdAt: SafeJson.readDateTime(json, ['createdAt']),
      updatedAt: SafeJson.readDateTime(json, ['updatedAt']),
      deletedAt: SafeJson.readNullableDateTime(json, ['deletedAt']),
      type: SafeJson.readString(json, ['type']),
      promotion: promotion,
    );
  }
}
