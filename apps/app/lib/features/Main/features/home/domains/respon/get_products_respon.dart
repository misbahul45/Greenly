import 'package:Greenly/core/utils/json_mapper.dart';
import 'package:Greenly/features/Main/features/home/domains/data/product_data.dart';

class GetProductsRespon {
  final List<ProductData> data;

  GetProductsRespon({required this.data});

  factory GetProductsRespon.fromJson(dynamic json) {
    return GetProductsRespon(
      data: JsonMapper.list<ProductData>(json, ProductData.fromJson),
    );
  }
}
