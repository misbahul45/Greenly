class ProfileStatsData {
  final int orders;
  final int following;
  final int reviews;
  final int favorites;

  const ProfileStatsData({
    this.orders = 0,
    this.following = 0,
    this.reviews = 0,
    this.favorites = 0,
  });

  ProfileStatsData copyWith({
    int? orders,
    int? following,
    int? reviews,
    int? favorites,
  }) {
    return ProfileStatsData(
      orders: orders ?? this.orders,
      following: following ?? this.following,
      reviews: reviews ?? this.reviews,
      favorites: favorites ?? this.favorites,
    );
  }
}
