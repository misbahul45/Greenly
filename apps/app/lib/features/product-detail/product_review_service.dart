import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';
import 'package:app/features/product-detail/domains/respon/get_reviews_respon.dart';

class ProductReviewService {
  static String get _baseUrlCatalog => ENV.catalogApiUrl;

  Future<ApiResponse<GetReviewsRespon>> getProductReviews({
    required String productId,
    int page = 1,
    int limit = 10,
  }) async {
    return await ApiClient.get(
      "$_baseUrlCatalog/reviews/product/$productId?page=$page&limit=$limit",
      fromJsonT: (json) => GetReviewsRespon.fromJson(json),
    );
  }
}
