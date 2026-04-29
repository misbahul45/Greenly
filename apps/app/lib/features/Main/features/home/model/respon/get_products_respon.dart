import 'package:app/core/utils/json_mapper.dart';
import 'package:app/features/Main/features/home/model/data/product_data.dart';

class GetProductsRespon {
  final List<ProductData> data;

  GetProductsRespon({required this.data});

  factory GetProductsRespon.fromJson(dynamic json) {
    return GetProductsRespon(
      data: JsonMapper.list<ProductData>(
        json is List ? json : json['data'],
        ProductData.fromJson,
      ),
    );
  }
}