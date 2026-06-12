import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';
import 'package:app/features/Main/features/home/domains/respon/get_products_respon.dart';

class ProductListService {
  static String get _base => '${ENV.api}/catalog/products';

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
        if (categoryId != null && categoryId.isNotEmpty) 'category_id': categoryId,
        if (shopId != null && shopId.isNotEmpty) 'shop_id': shopId,
        if (search != null && search.isNotEmpty) 'search': search,
      },
      fromJsonT: (json) => GetProductsRespon.fromJson(json),
    );
  }
}
