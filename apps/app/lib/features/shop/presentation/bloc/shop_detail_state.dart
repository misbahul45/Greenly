part of 'shop_detail_bloc.dart';

class ShopDetailState extends Equatable {
  final ShopData? shop;
  final bool isLoading;
  final bool isFollowing;
  final bool isToggling;
  final int followerCount;
  final String? error;

  const ShopDetailState({
    this.shop,
    this.isLoading = false,
    this.isFollowing = false,
    this.isToggling = false,
    this.followerCount = 0,
    this.error,
  });

  ShopDetailState copyWith({
    ShopData? shop,
    bool? isLoading,
    bool? isFollowing,
    bool? isToggling,
    int? followerCount,
    String? error,
  }) {
    return ShopDetailState(
      shop: shop ?? this.shop,
      isLoading: isLoading ?? this.isLoading,
      isFollowing: isFollowing ?? this.isFollowing,
      isToggling: isToggling ?? this.isToggling,
      followerCount: followerCount ?? this.followerCount,
      error: error,
    );
  }

  @override
  List<Object?> get props => [
    shop,
    isLoading,
    isFollowing,
    isToggling,
    followerCount,
    error,
  ];
}
