import 'package:Greenly/features/ml-products/domain/ml_search_filter.dart';
  
class MlSearchRequest {
  final String query;
  final int limit;
  final MlSearchFilter? filters;

  const MlSearchRequest({
    required this.query,
    this.limit = 10,
    this.filters,
  });

  Map<String, dynamic> toJson() {
    final m = <String, dynamic>{'query': query, 'limit': limit};
    if (filters != null && !filters!.isEmpty) {
      m['filters'] = filters!.toJson();
    }
    return m;
  }
}
