part of 'categories_bloc.dart';

class AllCategoriesState extends Equatable {
  final List<CategoryData> data;
  final bool isLoading;
  final bool isLoadingMore;
  final int page;
  final bool hasReachedMax;
  final String? error;

  const AllCategoriesState({
    this.data = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.page = 1,
    this.hasReachedMax = false,
    this.error,
  });

  AllCategoriesState copyWith({
    List<CategoryData>? data,
    bool? isLoading,
    bool? isLoadingMore,
    int? page,
    bool? hasReachedMax,
    String? error,
  }) {
    return AllCategoriesState(
      data: data ?? this.data,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      page: page ?? this.page,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
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
    error,
  ];
}
