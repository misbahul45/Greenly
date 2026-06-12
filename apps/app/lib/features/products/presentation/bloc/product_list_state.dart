part of 'product_list_bloc.dart';

class ProductListState extends Equatable {
  final List<ProductData> data;
  final bool isLoading;
  final bool isLoadingMore;
  final int page;
  final bool hasReachedMax;
  final String? categoryId;
  final String? shopId;
  final String? search;
  final String? error;

  const ProductListState({
    this.data = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.page = 1,
    this.hasReachedMax = false,
    this.categoryId,
    this.shopId,
    this.search,
    this.error,
  });

  ProductListState copyWith({
    List<ProductData>? data,
    bool? isLoading,
    bool? isLoadingMore,
    int? page,
    bool? hasReachedMax,
    String? categoryId,
    String? shopId,
    String? search,
    String? error,
  }) {
    return ProductListState(
      data: data ?? this.data,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      page: page ?? this.page,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      categoryId: categoryId ?? this.categoryId,
      shopId: shopId ?? this.shopId,
      search: search ?? this.search,
      error: error,
    );
  }

  @override
  List<Object?> get props => [
    data,
    isLoading,
    isLoadingMore,
    page,
    hasReachedMax,
    categoryId,
    shopId,
    search,
    error,
  ];
}
