part of 'profile_bloc.dart';

class ProfileState extends Equatable {
  final ProfileStatsData stats;
  final bool isLoading;

  const ProfileState({
    this.stats = const ProfileStatsData(),
    this.isLoading = false,
  });

  ProfileState copyWith({
    ProfileStatsData? stats,
    bool? isLoading,
  }) {
    return ProfileState(
      stats: stats ?? this.stats,
      isLoading: isLoading ?? this.isLoading,
    );
  }

  @override
  List<Object?> get props => [stats, isLoading];
}
