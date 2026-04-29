class MetaData {
  final int total;
  final int page;
  final int limit;
  final int lastPage;

  MetaData({
    required this.total,
    required this.page,
    required this.limit,
    required this.lastPage,
  });

  factory MetaData.fromJson(Map<String, dynamic> json) {
    return MetaData(
      total: json['total'] ?? 0,
      page: json['page'] ?? 0,
      limit: json['limit'] ?? 0,
      lastPage: json['lastPage'] ?? 0,
    );
  }
}