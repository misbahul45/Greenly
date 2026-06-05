import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';
import 'package:app/features/favorite/domain/data/favorite_data.dart';

class FavoriteService {
  static String get _base => '${ENV.api}/catalog/favorites';
  static String get _catalogBase => '${ENV.api}/catalog';

  Future<ApiResponse<ToggleFavoriteData>> toggle({
    required String productId,
  }) async {
    return await ApiClient.post('$_base/toggle', {
      'productId': productId,
    }, fromJsonT: (json) => ToggleFavoriteData.fromJson(json));
  }

  Future<ApiResponse<CheckFavoriteData>> check({
    required String productId,
  }) async {
    return await ApiClient.get(
      '$_base/check/$productId',
      fromJsonT: (json) => CheckFavoriteData.fromJson(json),
    );
  }
  Future<({List<FavoriteProductData> items, bool hasMore, int page})>
  getUserFavorites({int page = 1, int limit = 20}) async {
    final res = await ApiClient.get(
      '$_base?page=$page&limit=$limit',
      fromJsonT: (json) => FavoriteListData.fromJson(json),
    );

    if (!res.isSuccess || res.data == null) {
      return (items: <FavoriteProductData>[], hasMore: false, page: page);
    }

    final items = res.data!.favorites;
    final lastPage = res.metaData?.lastPage ?? 1;
    final hasMore = page < lastPage;

    final enriched = await Future.wait(
      items.map((fav) async {
        try {
          final pRes = await ApiClient.get<Map<String, dynamic>>(
            '$_catalogBase/products/${fav.productId}',
            fromJsonT: (json) => json as Map<String, dynamic>,
          );
          if (pRes.isSuccess && pRes.data != null) {
            final p = pRes.data!;
            final images = (p['imageUrls'] as List<dynamic>? ?? []);
            return FavoriteProductData(
              favoriteId: fav.id,
              productId: fav.productId,
              shopId: fav.shopId,
              name: p['name']?.toString() ?? '',
              slug: p['slug']?.toString() ?? '',
              imageUrl: images.isNotEmpty ? images.first.toString() : '',
              price: p['price'] is int ? p['price'] as int : 0,
              currency: p['currency']?.toString() ?? 'IDR',
              ratingAverage: (p['ratingAverage'] as num?)?.toDouble() ?? 0,
              reviewCount: p['reviewCount'] as int? ?? 0,
              stock: p['stock'] as int? ?? 0,
            );
          }
        } catch (_) {}
        return FavoriteProductData(
          favoriteId: fav.id,
          productId: fav.productId,
          shopId: fav.shopId,
          name: '',
          slug: '',
          imageUrl: '',
          price: 0,
          currency: 'IDR',
          ratingAverage: 0,
          reviewCount: 0,
          stock: 0,
        );
      }),
    );

    return (items: enriched, hasMore: hasMore, page: page);
  }
}
