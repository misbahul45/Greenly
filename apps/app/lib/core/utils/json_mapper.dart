import 'package:Greenly/core/utils/safe_json.dart';
import 'package:flutter/foundation.dart';

class JsonMapper {
  /// Parse a list of [T] from [json].
  ///
  /// Handles the following shapes safely (no crash on any of them):
  ///   - null
  ///   - []
  ///   - { "data": null }
  ///   - { "data": [] }
  ///   - { "data": { "items": [] } }
  ///   - { "data": { "data": [] } }
  ///   - { "items": [] }
  ///   - { "results": [] }
  ///   - direct List
  ///
  /// Items that fail to parse are skipped individually (not fail-all).
  static List<T> list<T>(
    dynamic json,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    final rawList = SafeJson.extractDataList(json);
    if (rawList.isEmpty) return [];

    final result = <T>[];
    for (int i = 0; i < rawList.length; i++) {
      final item = rawList[i];
      if (item == null) continue;
      if (item is! Map) {
        if (kDebugMode) {
          debugPrint('[JsonMapper] Skipping non-Map item at index $i: ${item.runtimeType}');
        }
        continue;
      }
      try {
        final map = item is Map<String, dynamic>
            ? item
            : item.cast<String, dynamic>();
        result.add(fromJson(map));
      } catch (e, st) {
        if (kDebugMode) {
          debugPrint('[JsonMapper] Failed to parse item at index $i: $e\n$st');
        }
        // Skip this item; do not fail the whole list.
      }
    }
    return result;
  }

  static T? object<T>(
    dynamic json,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    if (json == null || json is! Map<String, dynamic>) return null;
    return fromJson(json);
  }
}
