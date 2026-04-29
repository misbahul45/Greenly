import 'package:app/core/utils/json_mapper.dart';
import 'package:app/features/Main/features/home/model/data/category_data.dart';

class GetCategoriesRespon {
  final List<CategoryData> data;

  GetCategoriesRespon({required this.data});

  factory GetCategoriesRespon.fromJson(dynamic json) {
    return GetCategoriesRespon(
      data: JsonMapper.list<CategoryData>(
        json is List ? json : json['data'],
        CategoryData.fromJson,
      ),
    );
  }
}