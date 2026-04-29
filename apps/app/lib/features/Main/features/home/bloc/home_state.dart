import 'package:app/features/Main/features/home/model/data/banner_data.dart';
import 'package:app/features/Main/features/home/model/data/category_data.dart';
import 'package:app/features/Main/features/home/model/data/product_data.dart';

class ActiveBannersState {
  final List<BannerData> data;
  final bool isLoading;
  final String? message;

  const ActiveBannersState({
    this.data = const [],
    this.isLoading = false,
    this.message,
  });

  ActiveBannersState copyWith({
    List<BannerData>? data,
    bool? isLoading,
    String? message,
  }) {
    return ActiveBannersState(
      data: data ?? this.data,
      isLoading: isLoading ?? this.isLoading,
      message: message,
    );
  }
}

class CategoriesState {
  final List<CategoryData> data;
  final bool isLoading;
  final String? message;

  const CategoriesState({
    this.data = const [],
    this.isLoading = false,
    this.message,
  });

  CategoriesState copyWith({
    List<CategoryData>? data,
    bool? isLoading,
    String? message,
  }) {
    return CategoriesState(
      data: data ?? this.data,
      isLoading: isLoading ?? this.isLoading,
      message: message,
    );
  }
}

class ProductState {
  final List<ProductData> data;
  final bool isLoading;
  final bool isLoadingMore;
  final int page;
  final bool hasReachedMax;
  final String? message;

  const ProductState({
    this.data = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.page = 1,
    this.hasReachedMax = false,
    this.message,
  });

  ProductState copyWith({
    List<ProductData>? data,
    bool? isLoading,
    bool? isLoadingMore,
    int? page,
    bool? hasReachedMax,
    String? message,
  }) {
    return ProductState(
      data: data ?? this.data,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      page: page ?? this.page,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      message: message,
    );
  }
}

class HomeState {
  final ActiveBannersState banner;
  final CategoriesState category;
  final ProductState product;

  final String? error;

  const HomeState({
    this.banner = const ActiveBannersState(),
    this.category = const CategoriesState(),
    this.product = const ProductState(),
    this.error,
  });

  HomeState copyWith({
    ActiveBannersState? banner,
    CategoriesState? category,
    ProductState? product,
    String? error,
  }) {
    return HomeState(
      banner: banner ?? this.banner,
      category: category ?? this.category,
      product: product ?? this.product,
      error: error,
    );
  }
}