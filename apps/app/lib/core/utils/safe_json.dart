import 'package:flutter/foundation.dart';

/// Safe JSON parsing helpers.
/// All functions are null-safe and never throw.
/// Designed to be additive — does not replace existing parsing logic,
/// only supplements it with defensive fallbacks.
class SafeJson {
  SafeJson._();

  // ---------------------------------------------------------------------------
  // Type coercion helpers
  // ---------------------------------------------------------------------------

  /// Safely cast [value] to `Map`. Returns empty map on failure.
  static Map<String, dynamic> asMap(dynamic value) {
    if (value == null) return {};
    if (value is Map<String, dynamic>) return value;
    if (value is Map) {
      try {
        return value.cast<String, dynamic>();
      } catch (_) {}
    }
    return {};
  }

  /// Safely cast [value] to List. Returns empty list on failure.
  static List<dynamic> asList(dynamic value) {
    if (value == null) return [];
    if (value is List) return value;
    return [];
  }

  // ---------------------------------------------------------------------------
  // Scalar readers — accept multiple candidate keys
  // ---------------------------------------------------------------------------

  /// Read a String value, trying [keys] in order.
  static String readString(
    Map<dynamic, dynamic> json,
    List<String> keys, {
    String fallback = '',
  }) {
    for (final key in keys) {
      final v = json[key];
      if (v == null) continue;
      if (v is String) return v;
      return v.toString();
    }
    return fallback;
  }

  /// Read an int value, trying [keys] in order.
  static int readInt(
    Map<dynamic, dynamic> json,
    List<String> keys, {
    int fallback = 0,
  }) {
    for (final key in keys) {
      final v = json[key];
      if (v == null) continue;
      if (v is int) return v;
      if (v is num) return v.toInt();
      if (v is String) {
        final parsed = int.tryParse(v) ?? double.tryParse(v)?.toInt();
        if (parsed != null) return parsed;
      }
    }
    return fallback;
  }

  /// Read a double value, trying [keys] in order.
  static double readDouble(
    Map<dynamic, dynamic> json,
    List<String> keys, {
    double fallback = 0.0,
  }) {
    for (final key in keys) {
      final v = json[key];
      if (v == null) continue;
      if (v is double) return v;
      if (v is num) return v.toDouble();
      if (v is String) {
        final parsed = double.tryParse(v);
        if (parsed != null) return parsed;
      }
    }
    return fallback;
  }

  /// Read a bool value, trying [keys] in order.
  /// Accepts bool, int (0/1), or String ("true"/"false"/"1"/"0").
  static bool readBool(
    Map<dynamic, dynamic> json,
    List<String> keys, {
    bool fallback = false,
  }) {
    for (final key in keys) {
      final v = json[key];
      if (v == null) continue;
      if (v is bool) return v;
      if (v is int) return v != 0;
      if (v is String) {
        final lower = v.toLowerCase();
        if (lower == 'true' || lower == '1') return true;
        if (lower == 'false' || lower == '0') return false;
      }
    }
    return fallback;
  }

  /// Read a DateTime, trying [keys] in order. Returns [fallback] (default: epoch) on failure.
  static DateTime readDateTime(
    Map<dynamic, dynamic> json,
    List<String> keys, {
    DateTime? fallback,
  }) {
    final safe = fallback ?? DateTime.fromMillisecondsSinceEpoch(0);
    for (final key in keys) {
      final v = json[key];
      if (v == null) continue;
      if (v is String && v.isNotEmpty) {
        try {
          return DateTime.parse(v);
        } catch (_) {
          if (kDebugMode) {
            debugPrint('[SafeJson] Invalid date for key "$key": $v');
          }
        }
      }
      if (v is int) return DateTime.fromMillisecondsSinceEpoch(v);
    }
    return safe;
  }

  /// Read a nullable DateTime, trying [keys] in order. Returns null on failure.
  static DateTime? readNullableDateTime(
    Map<dynamic, dynamic> json,
    List<String> keys,
  ) {
    for (final key in keys) {
      final v = json[key];
      if (v == null) continue;
      if (v is String && v.isNotEmpty) {
        try {
          return DateTime.parse(v);
        } catch (_) {
          if (kDebugMode) {
            debugPrint('[SafeJson] Invalid nullable date for key "$key": $v');
          }
          return null;
        }
      }
      if (v is int) return DateTime.fromMillisecondsSinceEpoch(v);
    }
    return null;
  }

  /// Read a `List<String>`, trying [keys] in order.
  static List<String> readStringList(
    Map<dynamic, dynamic> json,
    List<String> keys,
  ) {
    for (final key in keys) {
      final v = json[key];
      if (v == null) continue;
      if (v is List) {
        return v
            .whereType<Object>()
            .map((e) => e.toString())
            .toList();
      }
      // Single string value wrapped in a list
      if (v is String && v.isNotEmpty) return [v];
    }
    return [];
  }

  /// Read a nested Map object, trying [keys] in order.
  static Map<String, dynamic>? readObject(
    Map<dynamic, dynamic> json,
    List<String> keys,
  ) {
    for (final key in keys) {
      final v = json[key];
      if (v == null) continue;
      final m = asMap(v);
      if (m.isNotEmpty) return m;
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Response shape extractors
  // ---------------------------------------------------------------------------

  /// Extract a List from various common API response shapes:
  /// - raw List
  /// - { "data": [...] }
  /// - { "data": { "items": [...] } }
  /// - { "data": { "data": [...] } }
  /// - { "items": [...] }
  /// - { "results": [...] }
  static List<dynamic> extractDataList(dynamic json) {
    if (json == null) return [];

    // Direct list
    if (json is List) return json;

    // Must be a Map from here
    if (json is! Map) {
      if (kDebugMode) {
        debugPrint('[SafeJson] extractDataList: unexpected shape ${json.runtimeType}');
      }
      return [];
    }

    // Try top-level list-like keys
    for (final key in ['data', 'items', 'results']) {
      final val = json[key];
      if (val == null) continue;

      if (val is List) return val;

      // Nested map: { "data": { "items": [...] } } or { "data": { "data": [...] } }
      if (val is Map) {
        for (final nestedKey in ['items', 'data', 'results']) {
          final nested = val[nestedKey];
          if (nested is List) return nested;
        }
      }
    }

    if (kDebugMode) {
      debugPrint('[SafeJson] extractDataList: no list found in response keys');
    }
    return [];
  }

  /// Extract a Map from various common API response shapes.
  static Map<String, dynamic> extractDataMap(dynamic json) {
    if (json == null) return {};
    if (json is Map<String, dynamic>) return json;
    if (json is Map) {
      try {
        return json.cast<String, dynamic>();
      } catch (_) {}
    }
    return {};
  }
}
