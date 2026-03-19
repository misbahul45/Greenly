import 'dart:convert';
import 'package:app/features/auth/auth_service.dart';
import 'package:app/features/auth/presentation/bloc/auth_storage.dart';
import 'package:http/http.dart' as http;
import 'package:app/core/utils/api_response.dart';

class ApiClient {
  static Future<Map<String, String>> _buildHeaders() async {
    final accessToken = await AuthStorage.getAccessToken();
    final refreshToken = await AuthStorage.getRefreshToken();

    final headers = <String, String>{"Content-Type": "application/json"};

    if (accessToken != null) {
      headers["Authorization"] = "Bearer $accessToken";
    }

    if (refreshToken != null) {
      headers["x-refresh-token"] = refreshToken;
    }

    return headers;
  }

  static Future<ApiResponse<T>> request<T>({
    required String method,
    required String url,
    T Function(dynamic json)? fromJsonT,
    Map<String, dynamic>? body,
    bool retry = true,
  }) async {
    try {
      final headers = await _buildHeaders();

      final req = http.Request(method, Uri.parse(url));
      req.headers.addAll(headers);

      if (body != null) {
        req.body = jsonEncode(body);
      }

      final streamed = await req.send();
      final res = await http.Response.fromStream(streamed);

      final dynamic decodedBody = res.body.isNotEmpty
          ? jsonDecode(res.body)
          : {};

      final Map<String, dynamic> decoded = decodedBody is Map<String, dynamic>
          ? decodedBody
          : {};

      if (res.statusCode == 401 && retry) {
        final refresh = await AuthService.refreshToken();

        if (refresh.status == "success" && refresh.data != null) {
          final access = refresh.data!.accessToken;
          final refreshToken = refresh.data!.refreshToken;

          await AuthStorage.saveTokens(
            accessToken: access,
            refreshToken: refreshToken,
          );

          return request(
            method: method,
            url: url,
            body: body,
            fromJsonT: fromJsonT,
            retry: false,
          );
        }

        await AuthStorage.clear();

        return ApiResponse<T>(
          status: "error",
          statusCode: 401,
          path: url,
          message: "Session expired",
          timestamp: DateTime.now().toIso8601String(),
          data: null,
        );
      }

      bool isSuccess = false;

      if (decoded["status"] is String) {
        isSuccess = decoded["status"] == "success";
      } else if (decoded["status"] is bool) {
        isSuccess = decoded["status"];
      }

      if (res.statusCode >= 200 && res.statusCode < 300 && isSuccess) {
        return ApiResponse<T>.fromJson(
          decoded,
          fromJsonT ?? (data) => data as T,
        );
      }

      return ApiResponse<T>(
        status: decoded["status"] is String ? decoded["status"] : "error",
        statusCode: decoded["statusCode"] is int
            ? decoded["statusCode"]
            : res.statusCode,
        path: decoded["path"]?.toString() ?? "",
        message: decoded["message"]?.toString() ?? "Unknown error",
        timestamp:
            decoded["timestamp"]?.toString() ??
            DateTime.now().toIso8601String(),
        data: null,
        metaData: decoded["metaData"],
      );
    } catch (e) {
      return ApiResponse<T>(
        status: "error",
        statusCode: 0,
        path: "",
        message: e.toString(),
        timestamp: DateTime.now().toIso8601String(),
        data: null,
      );
    }
  }

  static Future<ApiResponse<T>> get<T>(
    String url, {
    T Function(dynamic json)? fromJsonT,
  }) {
    return request<T>(method: "GET", url: url, fromJsonT: fromJsonT);
  }

  static Future<ApiResponse<T>> post<T>(
    String url,
    Map<String, dynamic> body, {
    T Function(dynamic json)? fromJsonT,
  }) {
    return request<T>(
      method: "POST",
      url: url,
      body: body,
      fromJsonT: fromJsonT,
    );
  }

  static Future<ApiResponse<T>> put<T>(
    String url,
    Map<String, dynamic> body, {
    T Function(dynamic json)? fromJsonT,
  }) {
    return request<T>(
      method: "PUT",
      url: url,
      body: body,
      fromJsonT: fromJsonT,
    );
  }

  static Future<ApiResponse<T>> patch<T>(
    String url,
    Map<String, dynamic> body, {
    T Function(dynamic json)? fromJsonT,
  }) {
    return request<T>(
      method: "PATCH",
      url: url,
      body: body,
      fromJsonT: fromJsonT,
    );
  }

  static Future<ApiResponse<T>> delete<T>(
    String url, {
    T Function(dynamic json)? fromJsonT,
  }) {
    return request<T>(
      method: "DELETE",
      url: url,
      fromJsonT: fromJsonT,
    );
  }
}
