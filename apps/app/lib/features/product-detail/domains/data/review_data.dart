class ReviewData {
  final String id;
  final String productId;
  final String userId;
  final int rating;
  final String title;
  final String comment;
  final bool isVerified;
  final int helpfulCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  ReviewData({
    required this.id,
    required this.productId,
    required this.userId,
    required this.rating,
    required this.title,
    required this.comment,
    required this.isVerified,
    required this.helpfulCount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ReviewData.fromJson(Map<String, dynamic> json) {
    return ReviewData(
      id: json['id'],
      productId: json['productId'],
      userId: json['userId'],
      rating: json['rating'],
      title: json['title'],
      comment: json['comment'],
      isVerified: json['isVerified'],
      helpfulCount: json['helpfulCount'] ?? 0,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'productId': productId,
      'userId': userId,
      'rating': rating,
      'title': title,
      'comment': comment,
      'isVerified': isVerified,
      'helpfulCount': helpfulCount,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}