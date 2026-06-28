import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';
import 'package:app/features/ml-products/domain/ml_product_result.dart';
import 'package:app/features/ml-products/domain/ml_search_request.dart';

class MlProductService {
  static String get _base => ENV.mlApiUrl;

  static List<MlProductResult> _parseList(dynamic data) {
    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map(MlProductResult.fromJson)
          .toList();
    }
    return const [];
  }

  Future<ApiResponse<List<MlProductResult>>> getHomeRecommendations({
    int limit = 10,
    List<String>? recentProductIds,
  }) {
    final query = <String, dynamic>{'limit': limit};
    if (recentProductIds != null && recentProductIds.isNotEmpty) {
      query['recent_product_ids'] = recentProductIds.join(',');
    }
    
    return ApiClient.get<List<MlProductResult>>(
      '$_base/recommendations/home',
      query: query,
      fromJsonT: _parseList,
    );
  }

  Future<ApiResponse<List<MlProductResult>>> getEcoRecommendations({
    int limit = 10,
  }) {
    return ApiClient.get<List<MlProductResult>>(
      '$_base/recommendations/eco',
      query: {'limit': limit},
      fromJsonT: _parseList,
    );
  }

  Future<ApiResponse<List<MlProductResult>>> getSimilarProducts(
    String productId, {
    int limit = 8,
  }) {
    return ApiClient.get<List<MlProductResult>>(
      '$_base/recommendations/similar/$productId',
      query: {'limit': limit},
      fromJsonT: _parseList,
    );
  }

  Future<ApiResponse<List<MlProductResult>>> searchSemantic(
    MlSearchRequest request,
  ) {
    return ApiClient.post<List<MlProductResult>>(
      '$_base/search',
      request.toJson(),
      fromJsonT: _parseList,
    );
  }

  Future<ApiResponse<dynamic>> logEvent({
    required String eventType,
    String? productId,
    String? source,
    Map<String, dynamic>? metadata,
  }) {
    final payload = <String, dynamic>{'event_type': eventType};
    if (productId != null) payload['product_id'] = productId;
    if (source != null) payload['source'] = source;
    if (metadata != null) payload['metadata'] = metadata;

    return ApiClient.post<dynamic>('$_base/events', payload);
  }
}
