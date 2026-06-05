import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';
import 'package:app/features/shop/domain/data/shop_data.dart';

class ShopService {
  static String get _base => '${ENV.API}/core/shops';
  static String get _meBase => '${ENV.API}/core/me';

  Future<ApiResponse<ShopData>> getShopById(String id) {
    return ApiClient.get<ShopData>(
      '$_base/$id',
      fromJsonT: (json) => ShopData.fromJson(json),
    );
  }

  Future<ApiResponse<List<ShopData>>> getFollowingShops({
    int page = 1,
    int limit = 20,
  }) {
    return ApiClient.get<List<ShopData>>(
      '$_meBase/following/shops',
      query: {'page': page, 'limit': limit},
      fromJsonT: ShopData.listFromJson,
    );
  }

  Future<ApiResponse<dynamic>> follow(String shopId) {
    return ApiClient.post<dynamic>('$_base/$shopId/follow', {});
  }

  Future<ApiResponse<dynamic>> unfollow(String shopId) {
    return ApiClient.delete<dynamic>('$_base/$shopId/follow');
  }
}
