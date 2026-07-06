import 'package:Greenly/features/ml-products/domain/ml_product_result.dart';

class SimilarProductsState {
  final List<MlProductResult> products;
  final bool isLoading;
  final String? error;

  const SimilarProductsState({
    this.products = const [],
    this.isLoading = false,
    this.error,
  });

  SimilarProductsState copyWith({
    List<MlProductResult>? products,
    bool? isLoading,
    String? error,
  }) {
    return SimilarProductsState(
      products: products ?? this.products,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}
