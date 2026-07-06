import 'package:Greenly/features/search-product/domain/dto/search_product_filter.dart';
import 'package:Greenly/features/search-product/service/search_product_service.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('SearchProductService', () {
    test('catalog fallback query includes active filters', () {
      final query = SearchProductService.buildCatalogFallbackQuery(
        query: 'tas',
        limit: 20,
        filters: const SearchProductFilter(
          categoryId: 'cat-1',
          minPrice: 10000,
          maxPrice: 50000,
          minEcoScore: 70,
        ),
      );

      expect(query['q'], 'tas');
      expect(query['page'], 1);
      expect(query['limit'], 20);
      expect(query['category_id'], 'cat-1');
      expect(query['min_price'], 10000);
      expect(query['max_price'], 50000);
      expect(query['min_eco_score'], 70);
    });
  });
}
