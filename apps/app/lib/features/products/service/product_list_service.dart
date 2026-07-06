import 'package:Greenly/core/config/env.dart';
import 'package:Greenly/core/utils/api_client.dart';
import 'package:Greenly/core/utils/api_response.dart';
import 'package:Greenly/features/Main/features/home/domains/respon/get_products_respon.dart';

class ProductListService {
  static String get _base => '${ENV.catalogApiUrl}/products';

  Future<ApiResponse<GetProductsRespon>> getProducts({
    int page = 1,
    int limit = 20,
    String? categoryId,
    String? shopId,
    String? search,
  }) {
    return ApiClient.get<GetProductsRespon>(
      _base,
      query: {
        'page': page,
        'limit': limit,
        if (categoryId != null && categoryId.isNotEmpty)
          'category_id': categoryId,
        if (shopId != null && shopId.isNotEmpty) 'shop_id': shopId,
        if (search != null && search.isNotEmpty) 'search': search,
      },
      fromJsonT: (json) => GetProductsRespon.fromJson(json),
    );
  }
}
