import 'dart:convert';
import 'package:http/http.dart' as http;
import 'api_response.dart';

class ApiClient {
  static const Map<String, String> _headers = {
    "Content-Type": "application/json",
  };

  static Future<ApiResponse<T>> request<T>({
    required String method,
    required String url,
    T Function(dynamic json)? fromJsonT,
    Map<String, dynamic>? body,
  }) async {
    try {
      final req = http.Request(method, Uri.parse(url));
      req.headers.addAll(_headers);

      if (body != null) {
        req.body = jsonEncode(body);
      }

      final streamed = await req.send();
      final res = await http.Response.fromStream(streamed);

      final decoded =
          res.body.isNotEmpty ? jsonDecode(res.body) : <String, dynamic>{};

      final bool status = decoded["status"] == true;

      if (res.statusCode >= 200 && res.statusCode < 300 && status) {
        return ApiResponse<T>.fromJson(
          decoded,
          fromJsonT ?? (data) => data as T,
        );
      }

      return ApiResponse<T>(
        status: false,
        statusCode: res.statusCode,
        path: decoded["path"] ?? "",
        message: decoded["message"] ?? "Unknown error",
        timestamp: decoded["timestamp"] ?? "",
        data: null,
      );
    } catch (e) {
      return ApiResponse<T>(
        status: false,
        statusCode: 0,
        path: "",
        message: "Network error",
        timestamp: DateTime.now().toIso8601String(),
        data: null,
      );
    }
  }

  static Future<ApiResponse<T>> get<T>(
    String url, {
    T Function(dynamic json)? fromJsonT,
  }) =>
      request<T>(
        method: "GET",
        url: url,
        fromJsonT: fromJsonT,
      );

  static Future<ApiResponse<T>> post<T>(
    String url,
    Map<String, dynamic> body, {
    T Function(dynamic json)? fromJsonT,
  }) =>
      request<T>(
        method: "POST",
        url: url,
        body: body,
        fromJsonT: fromJsonT,
      );

  static Future<ApiResponse<T>> put<T>(
    String url,
    Map<String, dynamic> body, {
    T Function(dynamic json)? fromJsonT,
  }) =>
      request<T>(
        method: "PUT",
        url: url,
        body: body,
        fromJsonT: fromJsonT,
      );

  static Future<ApiResponse<T>> patch<T>(
    String url,
    Map<String, dynamic> body, {
    T Function(dynamic json)? fromJsonT,
  }) =>
      request<T>(
        method: "PATCH",
        url: url,
        body: body,
        fromJsonT: fromJsonT,
      );

  static Future<ApiResponse<T>> delete<T>(
    String url, {
    T Function(dynamic json)? fromJsonT,
  }) =>
      request<T>(
        method: "DELETE",
        url: url,
        fromJsonT: fromJsonT,
      );
}