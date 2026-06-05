import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';
import 'package:app/features/ml-products/domain/ml_product_result.dart';
import 'package:app/features/ml-products/domain/ml_search_request.dart';

class MlProductService {
  static String get _base => '${ENV.API}/ml';

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
  }) {
    return ApiClient.get<List<MlProductResult>>(
      '$_base/recommendations/home',
      query: {'limit': limit},
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
}
