import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:Greenly/features/auth/auth_service.dart';
import 'package:Greenly/features/auth/presentation/bloc/auth_storage.dart';
import 'package:http/http.dart' as http;
import 'package:Greenly/core/utils/api_response.dart';
import 'package:Greenly/core/utils/metadata.dart';

class ApiClient {
  static const Duration _timeout = Duration(seconds: 20);

  static Future<Map<String, String>> _buildHeaders({bool json = true}) async {
    final accessToken = await AuthStorage.getAccessToken();
    final refreshToken = await AuthStorage.getRefreshToken();

    final headers = <String, String>{};

    if (json) {
      headers["Content-Type"] = "application/json";
    }

    if (accessToken != null) {
      headers["Authorization"] = "Bearer $accessToken";
    }

    if (refreshToken != null) {
      headers["x-refresh-token"] = refreshToken;
    }

    return headers;
  }

  static Uri buildUri(String url, [Map<String, dynamic>? query]) {
    final uri = Uri.parse(url);
    if (query == null || query.isEmpty) return uri;

    final clean = <String, String>{};
    query.forEach((key, value) {
      if (value == null) return;
      clean[key] = value.toString();
    });

    return uri.replace(
      queryParameters: {
        ...uri.queryParameters,
        ...clean,
      },
    );
  }

  static Future<ApiResponse<T>> request<T>({
    required String method,
    required String url,
    T Function(dynamic json)? fromJsonT,
    Map<String, dynamic>? body,
    Map<String, dynamic>? query,
    bool retry = true,
  }) async {
    final uri = buildUri(url, query);

    try {
      final headers = await _buildHeaders();

      final req = http.Request(method, uri);
      req.headers.addAll(headers);

      if (body != null) {
        req.body = jsonEncode(body);
      }

      final streamed = await req.send().timeout(_timeout);
      final res = await http.Response.fromStream(streamed);

      return _handleResponse<T>(
        res: res,
        url: uri.toString(),
        fromJsonT: fromJsonT,
        retry: retry,
        replay: () => request<T>(
          method: method,
          url: url,
          body: body,
          query: query,
          fromJsonT: fromJsonT,
          retry: false,
        ),
      );
    } on TimeoutException {
      return ApiResponse<T>(
        status: "error",
        statusCode: 408,
        path: uri.toString(),
        message: "Request timeout",
        timestamp: DateTime.now().toIso8601String(),
      );
    } catch (e) {
      return ApiResponse<T>(
        status: "error",
        statusCode: 0,
        path: uri.toString(),
        message: e.toString(),
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  static Future<ApiResponse<T>> _handleResponse<T>({
    required http.Response res,
    required String url,
    required T Function(dynamic json)? fromJsonT,
    required bool retry,
    required Future<ApiResponse<T>> Function() replay,
  }) async {
    dynamic decodedBody;
    try {
      decodedBody = res.body.isNotEmpty ? jsonDecode(res.body) : {};
    } catch (_) {
      final sc = res.statusCode;
      final String msg;
      if (sc == 502 || sc == 503) {
        msg = 'Server sedang tidak tersedia. Pastikan layanan backend berjalan.';
      } else if (sc == 504) {
        msg = 'Gateway timeout. Server terlalu lama merespons.';
      } else if (sc >= 500) {
        msg = 'Server mengalami gangguan (HTTP $sc). Coba lagi nanti.';
      } else if (sc == 404) {
        msg = 'Endpoint tidak ditemukan (HTTP $sc).';
      } else if (sc == 0) {
        msg = 'Tidak dapat terhubung ke server.';
      } else {
        msg = 'Respons tidak valid dari server (HTTP $sc).';
      }
      return ApiResponse<T>(
        status: "error",
        statusCode: sc,
        path: url,
        message: msg,
        timestamp: DateTime.now().toIso8601String(),
      );
    }

    final Map<String, dynamic> decoded =
        decodedBody is Map<String, dynamic> ? decodedBody : {};

    if (res.statusCode == 401 && retry) {
      final refresh = await AuthService.refreshToken();

      if (refresh.isSuccess && refresh.data != null) {
        await AuthStorage.saveTokens(
          accessToken: refresh.data!.accessToken,
          refreshToken: refresh.data!.refreshToken,
        );
        return replay();
      }

      await AuthStorage.clear();

      return ApiResponse<T>(
        status: "error",
        statusCode: 401,
        path: url,
        message: "Session expired",
        timestamp: DateTime.now().toIso8601String(),
      );
    }

    bool isSuccess = false;
    if (decoded["status"] is String) {
      isSuccess = decoded["status"] == "success";
    } else if (decoded["status"] is bool) {
      isSuccess = decoded["status"] as bool;
    }

    if (res.statusCode >= 200 && res.statusCode < 300 && isSuccess) {
      return ApiResponse<T>.fromJson(
        decoded,
        fromJsonT ?? (data) => data as T,
      );
    }

    return ApiResponse<T>(
      status: decoded["status"] is String ? decoded["status"] : "error",
      statusCode: decoded["statusCode"] ?? res.statusCode,
      path: decoded["path"]?.toString() ?? url,
      message: decoded["message"]?.toString() ?? "Unknown error",
      timestamp:
          decoded["timestamp"]?.toString() ?? DateTime.now().toIso8601String(),
      data: null,
      metaData: decoded["metaData"] != null
          ? MetaData.fromJson(decoded["metaData"])
          : null,
    );
  }

  static Future<ApiResponse<T>> get<T>(
    String url, {
    Map<String, dynamic>? query,
    T Function(dynamic json)? fromJsonT,
  }) {
    return request<T>(
      method: "GET",
      url: url,
      query: query,
      fromJsonT: fromJsonT,
    );
  }

  static Future<ApiResponse<T>> post<T>(
    String url,
    Map<String, dynamic> body, {
    Map<String, dynamic>? query,
    T Function(dynamic json)? fromJsonT,
  }) {
    return request<T>(
      method: "POST",
      url: url,
      body: body,
      query: query,
      fromJsonT: fromJsonT,
    );
  }

  static Future<ApiResponse<T>> put<T>(
    String url,
    Map<String, dynamic> body, {
    Map<String, dynamic>? query,
    T Function(dynamic json)? fromJsonT,
  }) {
    return request<T>(
      method: "PUT",
      url: url,
      body: body,
      query: query,
      fromJsonT: fromJsonT,
    );
  }

  static Future<ApiResponse<T>> patch<T>(
    String url,
    Map<String, dynamic> body, {
    Map<String, dynamic>? query,
    T Function(dynamic json)? fromJsonT,
  }) {
    return request<T>(
      method: "PATCH",
      url: url,
      body: body,
      query: query,
      fromJsonT: fromJsonT,
    );
  }

  static Future<ApiResponse<T>> delete<T>(
    String url, {
    Map<String, dynamic>? query,
    T Function(dynamic json)? fromJsonT,
  }) {
    return request<T>(
      method: "DELETE",
      url: url,
      query: query,
      fromJsonT: fromJsonT,
    );
  }

  static Future<ApiResponse<T>> upload<T>({
    required String url,
    required List<File> files,
    String fileField = "files",
    Map<String, String>? fields,
    Map<String, dynamic>? query,
    T Function(dynamic json)? fromJsonT,
    bool retry = true,
  }) async {
    final uri = buildUri(url, query);

    try {
      final headers = await _buildHeaders(json: false);

      final req = http.MultipartRequest("POST", uri);
      req.headers.addAll(headers);

      if (fields != null) {
        req.fields.addAll(fields);
      }

      for (final file in files) {
        req.files.add(
          await http.MultipartFile.fromPath(fileField, file.path),
        );
      }

      final streamed = await req.send().timeout(const Duration(seconds: 60));
      final res = await http.Response.fromStream(streamed);

      return _handleResponse<T>(
        res: res,
        url: uri.toString(),
        fromJsonT: fromJsonT,
        retry: retry,
        replay: () => upload<T>(
          url: url,
          files: files,
          fileField: fileField,
          fields: fields,
          query: query,
          fromJsonT: fromJsonT,
          retry: false,
        ),
      );
    } on TimeoutException {
      return ApiResponse<T>(
        status: "error",
        statusCode: 408,
        path: uri.toString(),
        message: "Upload timeout",
        timestamp: DateTime.now().toIso8601String(),
      );
    } catch (e) {
      return ApiResponse<T>(
        status: "error",
        statusCode: 0,
        path: uri.toString(),
        message: e.toString(),
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  static Stream<T> stream<T>(
    String url, {
    Map<String, dynamic>? query,
    T Function(dynamic json)? fromJsonT,
  }) async* {
    final uri = buildUri(url, query);

    try {
      final headers = await _buildHeaders();
      headers["Accept"] = "text/event-stream";
      headers["Cache-Control"] = "no-cache";

      final req = http.Request("GET", uri);
      req.headers.addAll(headers);

      final streamed = await req.send().timeout(_timeout);

      if (streamed.statusCode < 200 || streamed.statusCode >= 300) {
        throw HttpException(
          'Realtime connection failed (HTTP ${streamed.statusCode})',
          uri: uri,
        );
      }

      await for (final line
          in streamed.stream
              .transform(utf8.decoder)
              .transform(const LineSplitter())) {
        if (!line.startsWith("data:")) continue;

        final raw = line.substring(5).trim();
        if (raw.isEmpty) continue;

        final decoded = jsonDecode(raw);
        yield fromJsonT == null ? decoded as T : fromJsonT(decoded);
      }
    } on TimeoutException {
      throw TimeoutException('Realtime connection timeout', _timeout);
    }
  }
}
