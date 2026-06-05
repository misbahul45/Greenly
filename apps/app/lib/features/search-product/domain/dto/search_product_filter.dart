import 'package:equatable/equatable.dart';

class SearchProductFilter extends Equatable {
  final String? categoryId;
  final double? minPrice;
  final double? maxPrice;
  final double? minEcoScore;

  const SearchProductFilter({
    this.categoryId,
    this.minPrice,
    this.maxPrice,
    this.minEcoScore,
  });

  bool get isEmpty =>
      categoryId == null &&
      minPrice == null &&
      maxPrice == null &&
      minEcoScore == null;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    if (categoryId != null) map['category_id'] = categoryId;
    if (minPrice != null) map['min_price'] = minPrice;
    if (maxPrice != null) map['max_price'] = maxPrice;
    if (minEcoScore != null) map['min_eco_score'] = minEcoScore;
    return map;
  }

  @override
  List<Object?> get props => [categoryId, minPrice, maxPrice, minEcoScore];
}
