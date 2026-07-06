import 'package:Greenly/features/search-product/domain/dto/search_product_filter.dart';

class SemanticSearchRequest {
  final String query;
  final int limit;
  final SearchProductFilter? filters;

  const SemanticSearchRequest({
    required this.query,
    this.limit = 20,
    this.filters,
  });

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{
      'query': query,
      'limit': limit,
    };
    if (filters != null && !filters!.isEmpty) {
      map['filters'] = filters!.toJson();
    }
    return map;
  }
}
