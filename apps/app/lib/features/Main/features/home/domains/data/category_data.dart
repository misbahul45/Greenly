import 'package:Greenly/core/utils/safe_json.dart';

class CategoryData {
  final String id;
  final String name;
  final String slug;
  final DateTime createdAt;
  final DateTime updatedAt;

  CategoryData({
    required this.id,
    required this.name,
    required this.slug,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Returns a safe empty/default CategoryData.
  factory CategoryData.empty() {
    final epoch = DateTime.fromMillisecondsSinceEpoch(0);
    return CategoryData(
      id: '',
      name: '',
      slug: '',
      createdAt: epoch,
      updatedAt: epoch,
    );
  }

  factory CategoryData.fromJson(Map<String, dynamic> json) {
    final name = SafeJson.readString(json, ['name']);

    // slug fallback: use slug field, or derive from name
    String slug = SafeJson.readString(json, ['slug']);
    if (slug.isEmpty && name.isNotEmpty) {
      slug = name.toLowerCase().replaceAll(RegExp(r'\s+'), '-');
    }

    return CategoryData(
      id: SafeJson.readString(json, ['id']),
      name: name,
      slug: slug,
      createdAt: SafeJson.readDateTime(json, ['createdAt', 'created_at']),
      updatedAt: SafeJson.readDateTime(json, ['updatedAt', 'updated_at']),
    );
  }
}
