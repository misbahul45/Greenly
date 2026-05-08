

import 'package:app/core/utils/metadata.dart';
class ApiResponse<T> {
  final String status;
  final int statusCode;
  final String path;
  final String message;
  final T? data;
  final MetaData? metaData;
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
    final rawStatus = json['status'];

    String statusValue = "error";

    if (rawStatus is String) {
      statusValue = rawStatus;
    } else if (rawStatus is bool) {
      statusValue = rawStatus ? "success" : "error";
    }

    return ApiResponse<T>(
      status: statusValue,
      statusCode: json['statusCode'] ?? 0,
      path: json['path'] ?? '',
      message: json['message'] ?? '',
      timestamp: json['timestamp'] ?? '',
      data: json['data'] != null ? fromJsonT(json['data']) : null,
      metaData: json['metaData'] != null
          ? MetaData.fromJson(json['metaData'])
          : null,
    );
  }

  bool get isSuccess => status.toLowerCase() == "success";
}