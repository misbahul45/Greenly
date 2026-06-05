import 'package:equatable/equatable.dart';

class MlSearchFilter extends Equatable {
  final String? categoryId;
  final double? minPrice;
  final double? maxPrice;
  final double? minEcoScore;

  const MlSearchFilter({
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
    final m = <String, dynamic>{};
    if (categoryId != null) m['category_id'] = categoryId;
    if (minPrice != null) m['min_price'] = minPrice;
    if (maxPrice != null) m['max_price'] = maxPrice;
    if (minEcoScore != null) m['min_eco_score'] = minEcoScore;
    return m;
  }

  @override
  List<Object?> get props => [categoryId, minPrice, maxPrice, minEcoScore];
}
