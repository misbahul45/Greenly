import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';
import 'package:app/features/product-detail/domains/respon/get_detail_product_respon.dart';

class ProductDetailService {
  static String get _baseUrlCatalog => ENV.catalogApiUrl;

  Future<ApiResponse<GetDetailProductRespon>> getProducts({
    required String slug,
  }) async {
    return await ApiClient.get(
      "$_baseUrlCatalog/products/slug/$slug",
      fromJsonT: (json) => GetDetailProductRespon.fromJson(json),
    );
  }
}
