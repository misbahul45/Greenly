import 'package:app/core/utils/json_mapper.dart';
import 'package:app/features/Main/features/home/domains/data/banner_data.dart';
import 'package:app/features/Main/features/home/domains/data/category_data.dart';
import 'package:app/features/Main/features/home/domains/data/product_data.dart';
import 'package:app/features/Main/features/home/domains/data/promotion_data.dart';
import 'package:app/features/Main/features/home/domains/respon/active_banner_respon.dart';
import 'package:app/features/Main/features/home/domains/respon/get_categories_respon.dart';
import 'package:app/features/Main/features/home/domains/respon/get_products_respon.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  // ---------------------------------------------------------------------------
  // JsonMapper.list — response shape resilience
  // ---------------------------------------------------------------------------
  group('JsonMapper.list', () {
    test('returns [] for null', () {
      expect(
        JsonMapper.list<ProductData>(null, ProductData.fromJson),
        isEmpty,
      );
    });

    test('returns [] for empty list', () {
      expect(
        JsonMapper.list<ProductData>([], ProductData.fromJson),
        isEmpty,
      );
    });

    test('returns [] for { "data": null }', () {
      expect(
        JsonMapper.list<ProductData>({'data': null}, ProductData.fromJson),
        isEmpty,
      );
    });

    test('returns [] for { "data": [] }', () {
      expect(
        JsonMapper.list<ProductData>({'data': []}, ProductData.fromJson),
        isEmpty,
      );
    });

    test('returns [] for { "data": { "items": [] } }', () {
      expect(
        JsonMapper.list<ProductData>(
          {'data': {'items': []}},
          ProductData.fromJson,
        ),
        isEmpty,
      );
    });

    test('returns [] for { "items": [] }', () {
      expect(
        JsonMapper.list<ProductData>({'items': []}, ProductData.fromJson),
        isEmpty,
      );
    });

    test('parses items from direct list', () {
      final raw = [
        {'id': '1', 'name': 'Product A'},
      ];
      final result = JsonMapper.list<ProductData>(raw, ProductData.fromJson);
      expect(result, hasLength(1));
      expect(result.first.name, 'Product A');
    });

    test('parses items from { "data": [...] }', () {
      final raw = {
        'data': [
          {'id': '2', 'name': 'Product B'},
        ],
      };
      final result = JsonMapper.list<ProductData>(raw, ProductData.fromJson);
      expect(result, hasLength(1));
      expect(result.first.id, '2');
    });

    test('skips bad items, does not fail all', () {
      final raw = [
        {'id': '1', 'name': 'Good'},
        null,
        'not-a-map',
        {'id': '3', 'name': 'Also Good'},
      ];
      final result = JsonMapper.list<ProductData>(raw, ProductData.fromJson);
      // null and 'not-a-map' are skipped, good items are kept
      expect(result, hasLength(2));
    });
  });

  // ---------------------------------------------------------------------------
  // Model fromJson — never throws
  // ---------------------------------------------------------------------------
  group('BannerData.fromJson', () {
    test('does not throw on empty map', () {
      expect(() => BannerData.fromJson({}), returnsNormally);
    });

    test('does not throw on null dates', () {
      expect(
        () => BannerData.fromJson({'startDate': null, 'endDate': null}),
        returnsNormally,
      );
    });

    test('does not throw on invalid date strings', () {
      expect(
        () => BannerData.fromJson({'startDate': 'not-a-date'}),
        returnsNormally,
      );
    });

    test('parses imageUrl from alternative field names', () {
      final b1 = BannerData.fromJson({'image_url': 'http://img1'});
      expect(b1.imageUrl, 'http://img1');

      final b2 = BannerData.fromJson({'thumbnail': 'http://thumb'});
      expect(b2.imageUrl, 'http://thumb');
    });

    test('promotion is null when field is missing', () {
      final b = BannerData.fromJson({});
      expect(b.promotion, isNull);
    });

    test('promotion is null when field is not a valid Map', () {
      final b = BannerData.fromJson({'promotion': 'invalid'});
      expect(b.promotion, isNull);
    });
  });

  group('CategoryData.fromJson', () {
    test('does not throw on empty map', () {
      expect(() => CategoryData.fromJson({}), returnsNormally);
    });

    test('does not throw on null dates', () {
      expect(
        () => CategoryData.fromJson({'createdAt': null}),
        returnsNormally,
      );
    });

    test('derives slug from name when slug is absent', () {
      final c = CategoryData.fromJson({'name': 'Eco Products'});
      expect(c.slug, 'eco-products');
    });

    test('uses provided slug when available', () {
      final c = CategoryData.fromJson({'name': 'Eco', 'slug': 'eco-custom'});
      expect(c.slug, 'eco-custom');
    });
  });

  group('ProductData.fromJson', () {
    test('does not throw on empty map', () {
      expect(() => ProductData.fromJson({}), returnsNormally);
    });

    test('defaults numeric fields to 0', () {
      final p = ProductData.fromJson({});
      expect(p.price, 0);
      expect(p.stock, 0);
      expect(p.ratingAverage, 0.0);
      expect(p.ecoScore, 0.0);
    });

    test('parses imageUrls from alternative field', () {
      final p = ProductData.fromJson({'imageUrl': 'http://img'});
      expect(p.imageUrls, ['http://img']);
    });

    test('eco is null when field is missing', () {
      final p = ProductData.fromJson({});
      expect(p.eco, isNull);
    });

    test('promotion is null when field is missing', () {
      final p = ProductData.fromJson({});
      expect(p.promotion, isNull);
    });

    test('handles String prices', () {
      final p = ProductData.fromJson({'price': '15000', 'stock': '3'});
      expect(p.price, 15000);
      expect(p.stock, 3);
    });

    test('toProductCardData does not throw on empty product', () {
      final p = ProductData.empty();
      expect(() => p.toProductCardData(), returnsNormally);
    });
  });

  group('PromotionData.fromJson', () {
    test('does not throw on empty map', () {
      expect(() => PromotionData.fromJson({}), returnsNormally);
    });

    test('reads name from "name" field', () {
      final p = PromotionData.fromJson({'name': 'Promo A'});
      expect(p.name, 'Promo A');
      expect(p.title, 'Promo A');
    });

    test('reads name from "title" field as fallback', () {
      final p = PromotionData.fromJson({'title': 'Promo B'});
      expect(p.title, 'Promo B');
    });

    test('reads name from "label" as further fallback', () {
      final p = PromotionData.fromJson({'label': 'Promo C'});
      expect(p.title, 'Promo C');
    });

    test('handles hasPromo as bool', () {
      expect(
        PromotionData.fromJson({'hasPromo': true}).hasPromo,
        isTrue,
      );
    });

    test('handles discountPercent as String', () {
      final p = PromotionData.fromJson({'discountPercent': '25.5'});
      expect(p.discountPercent, 25.5);
    });
  });

  // ---------------------------------------------------------------------------
  // Response wrappers — never throw, return empty list
  // ---------------------------------------------------------------------------
  group('ActiveBannerRespon.fromJson', () {
    test('returns empty list for null', () {
      expect(ActiveBannerRespon.fromJson(null).data, isEmpty);
    });

    test('returns empty list for empty map', () {
      expect(ActiveBannerRespon.fromJson({}).data, isEmpty);
    });

    test('returns empty list for { "data": null }', () {
      expect(ActiveBannerRespon.fromJson({'data': null}).data, isEmpty);
    });

    test('parses list correctly', () {
      final result = ActiveBannerRespon.fromJson({
        'data': [
          {'id': 'b1', 'title': 'Banner 1'},
        ],
      });
      expect(result.data, hasLength(1));
      expect(result.data.first.title, 'Banner 1');
    });
  });

  group('GetCategoriesRespon.fromJson', () {
    test('returns empty list for null', () {
      expect(GetCategoriesRespon.fromJson(null).data, isEmpty);
    });

    test('returns empty list for { "data": null }', () {
      expect(GetCategoriesRespon.fromJson({'data': null}).data, isEmpty);
    });

    test('parses list correctly', () {
      final result = GetCategoriesRespon.fromJson({
        'data': [
          {'id': 'c1', 'name': 'Eco'},
        ],
      });
      expect(result.data, hasLength(1));
      expect(result.data.first.name, 'Eco');
    });
  });

  group('GetProductsRespon.fromJson', () {
    test('returns empty list for null', () {
      expect(GetProductsRespon.fromJson(null).data, isEmpty);
    });

    test('returns empty list for { "data": null }', () {
      expect(GetProductsRespon.fromJson({'data': null}).data, isEmpty);
    });

    test('returns empty list for { "data": [] }', () {
      expect(GetProductsRespon.fromJson({'data': []}).data, isEmpty);
    });

    test('parses nested { "data": { "items": [...] } }', () {
      final result = GetProductsRespon.fromJson({
        'data': {
          'items': [
            {'id': 'p1', 'name': 'Product 1'},
          ],
        },
      });
      expect(result.data, hasLength(1));
      expect(result.data.first.id, 'p1');
    });
  });
}
