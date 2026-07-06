import 'package:Greenly/features/product-detail/domains/data/detail_product_data.dart';
import 'package:Greenly/features/product-detail/domains/data/review_data.dart';

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

class ReviewsState {
  final List<ReviewData> data;
  final bool isLoading;
  final bool isLoadingMore;
  final int page;
  final bool hasReachedMax;
  final String? message;

  const ReviewsState({
    this.data = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.page = 1,
    this.hasReachedMax = false,
    this.message,
  });

  ReviewsState copyWith({
    List<ReviewData>? data,
    bool? isLoading,
    bool? isLoadingMore,
    int? page,
    bool? hasReachedMax,
    String? message,
  }) {
    return ReviewsState(
      data: data ?? this.data,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      page: page ?? this.page,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      message: message,
    );
  }
}

class ProductDetailState {
  final DetailProductDataState product;
  final ReviewsState reviews;
  final String? error;

  const ProductDetailState({
    this.product = const DetailProductDataState(),
    this.reviews = const ReviewsState(),
    this.error,
  });

  ProductDetailState copyWith({
    DetailProductDataState? product,
    ReviewsState? reviews,
    String? error,
  }) {
    return ProductDetailState(
      product: product ?? this.product,
      reviews: reviews ?? this.reviews,
      error: error,
    );
  }
}
