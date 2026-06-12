import 'package:app/core/utils/safe_json.dart';

/// Unified PromotionData.
///
/// Merges the simple banner promotion shape (id / code / name)
/// with the richer product promotion shape
/// (hasPromo / discountPercent / discountAmount / label / …).
///
/// All fields have safe defaults so fromJson never throws.
class PromotionData {
  // --- Simple banner promotion fields ---
  final String id;

  // --- Rich product promotion fields ---
  final bool hasPromo;
  final String code;
  final String title; // mapped from 'name', 'title', or 'label'
  final String type;
  final double discountPercent;
  final double discountAmount;
  final String label;
  final String savingLabel;
  final DateTime? startsAt;
  final DateTime? endsAt;

  /// Convenience getter — keeps legacy callers using `name` working.
  String get name => title;

  PromotionData({
    this.id = '',
    this.hasPromo = false,
    this.code = '',
    this.title = '',
    this.type = '',
    this.discountPercent = 0.0,
    this.discountAmount = 0.0,
    this.label = '',
    this.savingLabel = '',
    this.startsAt,
    this.endsAt,
  });

  /// Returns a safe empty PromotionData.
  factory PromotionData.empty() => PromotionData();

  factory PromotionData.fromJson(Map<String, dynamic> json) {
    // 'name' field comes from legacy banner shape; also try 'title' and 'label'
    final title = SafeJson.readString(json, ['name', 'title', 'label', 'code']);

    return PromotionData(
      id: SafeJson.readString(json, ['id']),
      hasPromo: SafeJson.readBool(json, ['hasPromo', 'has_promo']),
      code: SafeJson.readString(json, ['code']),
      title: title,
      type: SafeJson.readString(json, ['type']),
      discountPercent: SafeJson.readDouble(json, ['discountPercent', 'discount_percent']),
      discountAmount: SafeJson.readDouble(json, ['discountAmount', 'discount_amount']),
      label: SafeJson.readString(json, ['label']),
      savingLabel: SafeJson.readString(json, ['savingLabel', 'saving_label']),
      startsAt: SafeJson.readNullableDateTime(json, ['startsAt', 'starts_at', 'startDate']),
      endsAt: SafeJson.readNullableDateTime(json, ['endsAt', 'ends_at', 'endDate']),
    );
  }
}
