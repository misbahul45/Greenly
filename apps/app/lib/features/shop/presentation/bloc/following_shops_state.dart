part of 'following_shops_bloc.dart';

class FollowingShopsState extends Equatable {
  final List<ShopData> data;
  final bool isLoading;
  final bool isLoadingMore;
  final int page;
  final bool hasReachedMax;
  final String? error;

  const FollowingShopsState({
    this.data = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.page = 1,
    this.hasReachedMax = false,
    this.error,
  });

  FollowingShopsState copyWith({
    List<ShopData>? data,
    bool? isLoading,
    bool? isLoadingMore,
    int? page,
    bool? hasReachedMax,
    String? error,
  }) {
    return FollowingShopsState(
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
