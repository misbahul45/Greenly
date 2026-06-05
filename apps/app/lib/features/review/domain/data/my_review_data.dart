import 'package:app/features/product-detail/domains/data/review_data.dart';

class MyReviewData {
  final ReviewData review;
  final String? productName;
  final String? productImageUrl;

  const MyReviewData({
    required this.review,
    this.productName,
    this.productImageUrl,
  });

  MyReviewData copyWith({
    String? productName,
    String? productImageUrl,
  }) {
    return MyReviewData(
      review: review,
      productName: productName ?? this.productName,
      productImageUrl: productImageUrl ?? this.productImageUrl,
    );
  }
}
