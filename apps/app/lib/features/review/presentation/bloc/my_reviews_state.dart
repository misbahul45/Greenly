part of 'my_reviews_bloc.dart';

class MyReviewsState extends Equatable {
  final bool isLoading;
  final bool isLoadingMore;
  final List<MyReviewData> items;
  final int page;
  final bool hasReachedMax;
  final String? error;

  const MyReviewsState({
    this.isLoading = false,
    this.isLoadingMore = false,
    this.items = const [],
    this.page = 1,
    this.hasReachedMax = false,
    this.error,
  });

  MyReviewsState copyWith({
    bool? isLoading,
    bool? isLoadingMore,
    List<MyReviewData>? items,
    int? page,
    bool? hasReachedMax,
    String? error,
  }) {
    return MyReviewsState(
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      items: items ?? this.items,
      page: page ?? this.page,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      error: error,
    );
  }

  @override
  List<Object?> get props => [
    isLoading,
    isLoadingMore,
    items,
    page,
    hasReachedMax,
    error,
  ];
}
