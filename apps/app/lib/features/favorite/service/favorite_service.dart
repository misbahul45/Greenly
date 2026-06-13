import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';
import 'package:app/features/favorite/domain/data/favorite_data.dart';

class FavoriteService {
  static String get _base => '${ENV.catalogApiUrl}/favorites';

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

  Future<({List<FavoriteProductData> items, bool hasMore, int page, int total})>
  getUserFavorites({int page = 1, int limit = 20}) async {
    final res = await ApiClient.get(
      '$_base?page=$page&limit=$limit',
      fromJsonT: (json) =>
          FavoriteListData.fromJson(json as Map<String, dynamic>),
    );

    if (!res.isSuccess || res.data == null) {
      return (
        items: <FavoriteProductData>[],
        hasMore: false,
        page: page,
        total: 0,
      );
    }

    final favItems = res.data!.favorites;
    final lastPage = res.metaData?.lastPage ?? 1;
    final total = res.metaData?.total ?? favItems.length;
    final hasMore = page < lastPage;

    final items = favItems
        .map(
          (fav) => FavoriteProductData(
            favoriteId: fav.id,
            productId: fav.productId,
            shopId: fav.shopId,
            name: fav.name,
            slug: fav.slug,
            imageUrl: fav.imageUrl,
            price: fav.price,
            currency: fav.currency,
            ratingAverage: fav.ratingAverage,
            reviewCount: fav.reviewCount,
            stock: fav.stock,
            categoryName: fav.categoryName,
            shopName: fav.shopName,
            favoriteCount: fav.favoriteCount,
          ),
        )
        .toList();

    return (items: items, hasMore: hasMore, page: page, total: total);
  }
}
