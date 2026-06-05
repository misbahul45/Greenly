import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';
import 'package:app/features/product-detail/domains/respon/get_reviews_respon.dart';
import 'package:app/features/review/domain/data/my_review_data.dart';
import 'package:app/features/review/domain/dto/review_dto.dart';

class ReviewService {
  static String get _base => '${ENV.API}/catalog/reviews';
  static String get _catalogBase => '${ENV.API}/catalog';

  Future<({List<MyReviewData> items, bool hasMore, int page})> getMyReviews({
    int page = 1,
    int limit = 20,
  }) async {
    final res = await ApiClient.get<GetReviewsRespon>(
      '$_base/mine',
      query: {'page': page, 'limit': limit},
      fromJsonT: (json) => GetReviewsRespon.fromJson(json),
    );

    if (!res.isSuccess || res.data == null) {
      return (items: <MyReviewData>[], hasMore: false, page: page);
    }

    final lastPage = res.metaData?.lastPage ?? 1;
    final enriched = await Future.wait(
      res.data!.data.map((review) async {
        try {
          final pRes = await ApiClient.get<Map<String, dynamic>>(
            '$_catalogBase/products/${review.productId}',
            fromJsonT: (json) => json as Map<String, dynamic>,
          );
          if (pRes.isSuccess && pRes.data != null) {
            final p = pRes.data!;
            final images = (p['imageUrls'] as List<dynamic>? ?? []);
            return MyReviewData(
              review: review,
              productName: p['name']?.toString(),
              productImageUrl:
                  images.isNotEmpty ? images.first.toString() : null,
            );
          }
        } catch (_) {}
        return MyReviewData(review: review);
      }),
    );

    return (items: enriched, hasMore: page < lastPage, page: page);
  }

  Future<ApiResponse<dynamic>> create(CreateReviewDto dto) {
    return ApiClient.post<dynamic>(_base, dto.toJson());
  }

  Future<ApiResponse<dynamic>> update(String reviewId, UpdateReviewDto dto) {
    return ApiClient.put<dynamic>('$_base/$reviewId', dto.toJson());
  }

  Future<ApiResponse<dynamic>> delete(String reviewId) {
    return ApiClient.delete<dynamic>('$_base/$reviewId');
  }

  Future<ApiResponse<dynamic>> markHelpful(String reviewId) {
    return ApiClient.post<dynamic>('$_base/$reviewId/helpful', {});
  }
}
