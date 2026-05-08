class JsonMapper {
  static List<T> list<T>(
    dynamic json,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    if (json is! List) return [];
    return json.map((e) => fromJson(e)).toList().cast<T>();
  }

  static T? object<T>(
    dynamic json,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    if (json == null || json is! Map<String, dynamic>) return null;
    return fromJson(json);
  }
}