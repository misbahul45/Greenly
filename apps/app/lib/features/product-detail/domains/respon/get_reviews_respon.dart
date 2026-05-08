import 'package:app/core/utils/json_mapper.dart';
import 'package:app/features/product-detail/domains/data/review_data.dart';

class GetReviewsRespon {
  final List<ReviewData> data;

  GetReviewsRespon({required this.data});

  factory GetReviewsRespon.fromJson(dynamic json) {
    return GetReviewsRespon(
      data: JsonMapper.list<ReviewData>(
        json is List ? json : json['data'],
        ReviewData.fromJson,
      ),
    );
  }
}

class ReviewsMetaData {
  final int total;
  final int page;
  final int limit;
  final int lastPage;

  ReviewsMetaData({
    required this.total,
    required this.page,
    required this.limit,
    required this.lastPage,
  });

  factory ReviewsMetaData.fromJson(Map<String, dynamic> json) {
    return ReviewsMetaData(
      total: json['total'] ?? 0,
      page: json['page'] ?? 1,
      limit: json['limit'] ?? 20,
      lastPage: json['lastPage'] ?? 1,
    );
  }
}