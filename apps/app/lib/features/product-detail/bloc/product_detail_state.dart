import 'package:app/features/product-detail/domains/data/detail_product_data.dart';

class DetailProductDataState {
  final DetailProductData? data;
  final bool isLoading;
  final String? message;

  const DetailProductDataState({
    this.data,
    this.isLoading = false,
    this.message,
  });

  DetailProductDataState copyWith({
    DetailProductData? data,
    bool? isLoading,
    String? message,
  }) {
    return DetailProductDataState(
      data: data ?? this.data,
      isLoading: isLoading ?? this.isLoading,
      message: message,
    );
  }
}


class ProductDetailState {
  final DetailProductDataState product;
  final String? error;

  const ProductDetailState({
    this.product = const DetailProductDataState(),
    this.error,
  });

  ProductDetailState copyWith({
    DetailProductDataState? product,
    String? error,
  }) {
    return ProductDetailState(
      product: product ?? this.product,
      error: error,
    );
  }
}