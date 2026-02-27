class ApiResponse<T> {
  final bool status;
  final int statusCode;
  final String path;
  final String message;
  final T? data;
  final String timestamp;

  ApiResponse({
    required this.status,
    required this.statusCode,
    required this.path,
    required this.message,
    required this.timestamp,
    this.data,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic json) fromJsonT,
  ) {
    return ApiResponse<T>(
      status: json['status'] ?? false,
      statusCode: json['statusCode'] ?? 0,
      path: json['path'] ?? '',
      message: json['message'] ?? '',
      timestamp: json['timestamp'] ?? '',
      data: json['data'] != null ? fromJsonT(json['data']) : null,
    );
  }

  bool get isSuccess => status;
}