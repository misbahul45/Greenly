part of 'profile_bloc.dart';

class ProfileState extends Equatable {
  final ProfileStatsData stats;
  final bool isLoading;
  final String? error;

  const ProfileState({
    this.stats = const ProfileStatsData(),
    this.isLoading = false,
    this.error,
  });

  ProfileState copyWith({
    ProfileStatsData? stats,
    bool? isLoading,
    String? error,
  }) {
    return ProfileState(
      stats: stats ?? this.stats,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  @override
  List<Object?> get props => [stats, isLoading, error];
}
