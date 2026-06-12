part of 'favorite_bloc.dart';

class FavoriteState extends Equatable {
  final String? productId;
  final bool isFavorite;
  final bool isLoading;
  final bool isToggling;
  final String? error;

  final List<FavoriteProductData> favorites;
  final bool isListLoading;
  final bool isListLoadingMore;
  final int listPage;
  final bool listHasReachedMax;
  final int totalFavorites;

  const FavoriteState({
    this.productId,
    this.isFavorite = false,
    this.isLoading = false,
    this.isToggling = false,
    this.error,
    this.favorites = const [],
    this.isListLoading = false,
    this.isListLoadingMore = false,
    this.listPage = 1,
    this.listHasReachedMax = false,
    this.totalFavorites = 0,
  });

  FavoriteState copyWith({
    String? productId,
    bool? isFavorite,
    bool? isLoading,
    bool? isToggling,
    String? error,
    List<FavoriteProductData>? favorites,
    bool? isListLoading,
    bool? isListLoadingMore,
    int? listPage,
    bool? listHasReachedMax,
    int? totalFavorites,
  }) {
    return FavoriteState(
      productId: productId ?? this.productId,
      isFavorite: isFavorite ?? this.isFavorite,
      isLoading: isLoading ?? this.isLoading,
      isToggling: isToggling ?? this.isToggling,
      error: error,
      favorites: favorites ?? this.favorites,
      isListLoading: isListLoading ?? this.isListLoading,
      isListLoadingMore: isListLoadingMore ?? this.isListLoadingMore,
      listPage: listPage ?? this.listPage,
      listHasReachedMax: listHasReachedMax ?? this.listHasReachedMax,
      totalFavorites: totalFavorites ?? this.totalFavorites,
    );
  }

  @override
  List<Object?> get props => [
    productId,
    isFavorite,
    isLoading,
    isToggling,
    error,
    favorites,
    isListLoading,
    isListLoadingMore,
    listPage,
    listHasReachedMax,
    totalFavorites,
  ];
}
