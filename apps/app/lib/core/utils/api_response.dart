class ApiResponse<T> {
  final String status;
  final int statusCode;
  final String path;
  final String message;
  final T? data;
  final dynamic metaData;
  final String timestamp;

  ApiResponse({
    required this.status,
    required this.statusCode,
    required this.path,
    required this.message,
    required this.timestamp,
    this.data,
    this.metaData,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic json) fromJsonT,
  ) {
    return ApiResponse<T>(
      status: json['status'] ?? 'error',
      statusCode: json['statusCode'] ?? 0,
      path: json['path'] ?? '',
      message: json['message'] ?? '',
      timestamp: json['timestamp'] ?? '',
      metaData: json['metaData'],
      data: json['data'] != null ? fromJsonT(json['data']) : null,
    );
  }

  bool get isSuccess => status == "success";
}