import 'package:Greenly/features/Main/features/profile/domain/data/profile_stats_data.dart';
import 'package:Greenly/features/Main/features/profile/profile_service.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'profile_event.dart';
part 'profile_state.dart';

class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  final ProfileService _service;

  ProfileBloc(this._service) : super(const ProfileState()) {
    on<ProfileStatsRequested>(_onStats);
  }

  Future<void> _onStats(
    ProfileStatsRequested event,
    Emitter<ProfileState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, error: null));
    final result = await _service.getStats();
    emit(
      state.copyWith(
        isLoading: false,
        stats: result.stats,
        error: result.error,
      ),
    );
  }
}
