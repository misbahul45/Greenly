import 'package:Greenly/features/product-detail/domains/data/detail_product_data.dart';

class GetDetailProductRespon {
  final DetailProductData data;

  GetDetailProductRespon({required this.data});

  factory GetDetailProductRespon.fromJson(Map<String, dynamic> json) {
    return GetDetailProductRespon(data: DetailProductData.fromJson(json));
  }
}