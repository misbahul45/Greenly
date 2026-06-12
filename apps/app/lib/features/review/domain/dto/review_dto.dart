class CreateReviewDto {
  final String productId;
  final int rating;
  final String title;
  final String comment;
  final String? orderId;

  CreateReviewDto({
    required this.productId,
    required this.rating,
    required this.title,
    required this.comment,
    this.orderId,
  });

  Map<String, dynamic> toJson() => {
    'productId': productId,
    'rating': rating,
    'title': title,
    'comment': comment,
    if (orderId != null && orderId!.isNotEmpty) 'orderId': orderId,
  };
}

class UpdateReviewDto {
  final int? rating;
  final String? title;
  final String? comment;

  UpdateReviewDto({this.rating, this.title, this.comment});

  Map<String, dynamic> toJson() => {
    if (rating != null) 'rating': rating,
    if (title != null) 'title': title,
    if (comment != null) 'comment': comment,
  };
}
