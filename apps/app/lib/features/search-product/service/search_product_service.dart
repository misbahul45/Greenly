import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/features/search-product/domain/data/search_product_result.dart';
import 'package:app/features/search-product/domain/dto/search_product_filter.dart';
import 'package:app/features/search-product/domain/dto/semantic_search_request.dart';

class SearchResultPair {
  final List<SearchProductResult> results;
  final bool fromFallback;

  const SearchResultPair(this.results, {required this.fromFallback});
}

class SearchProductService {
  static const int _defaultLimit = 20;

  Future<SearchResultPair> search({
    required String query,
    int limit = _defaultLimit,
    SearchProductFilter? filters,
  }) async {
    try {
      final request = SemanticSearchRequest(
        query: query,
        limit: limit,
        filters: filters,
      );

      final mlResp = await ApiClient.post<List<SearchProductResult>>(
        '${ENV.mlApiUrl}/search',
        request.toJson(),
        fromJsonT: _parseMlResults,
      );

      if (mlResp.isSuccess && (mlResp.data?.isNotEmpty ?? false)) {
        return SearchResultPair(mlResp.data!, fromFallback: false);
      }
    } catch (_) {}

    final catalogResp = await ApiClient.get<List<SearchProductResult>>(
      '${ENV.catalogApiUrl}/products/search',
      query: buildCatalogFallbackQuery(
        query: query,
        limit: limit,
        filters: filters,
      ),
      fromJsonT: _parseCatalogResults,
    );

    return SearchResultPair(catalogResp.data ?? [], fromFallback: true);
  }

  static Map<String, dynamic> buildCatalogFallbackQuery({
    required String query,
    required int limit,
    SearchProductFilter? filters,
  }) {
    return {
      'q': query,
      'page': 1,
      'limit': limit,
      if (filters != null && !filters.isEmpty) ...filters.toJson(),
    };
  }

  static List<SearchProductResult> _parseMlResults(dynamic json) {
    final list = json is List ? json : <dynamic>[];
    return list
        .whereType<Map<String, dynamic>>()
        .map(SearchProductResult.fromMl)
        .where((r) => r.id.isNotEmpty)
        .toList();
  }

  static List<SearchProductResult> _parseCatalogResults(dynamic json) {
    final list = json is List ? json : <dynamic>[];
    return list
        .whereType<Map<String, dynamic>>()
        .map(SearchProductResult.fromCatalog)
        .where((r) => r.id.isNotEmpty)
        .toList();
  }
}
