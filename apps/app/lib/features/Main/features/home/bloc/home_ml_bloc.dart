import 'package:Greenly/features/Main/features/home/bloc/home_ml_event.dart';
import 'package:Greenly/features/Main/features/home/bloc/home_ml_state.dart';
import 'package:Greenly/features/ml-products/service/ml_product_service.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class HomeMlBloc extends Bloc<HomeMlEvent, HomeMlState> {
  final MlProductService _service;

  HomeMlBloc(this._service) : super(const HomeMlState()) {
    on<HomeMlStarted>(_onStarted);
    on<HomeMlRefreshed>(_onRefreshed);
  }

  Future<void> _onStarted(HomeMlStarted _, Emitter<HomeMlState> emit) async {
    await _load(emit);
  }

  Future<void> _onRefreshed(
    HomeMlRefreshed _,
    Emitter<HomeMlState> emit,
  ) async {
    emit(
      state.copyWith(
        homeRecs: state.homeRecs.copyWith(isLoading: true, error: null),
        ecoRecs: state.ecoRecs.copyWith(isLoading: true, error: null),
      ),
    );
    await _load(emit);
  }

  Future<void> _load(Emitter<HomeMlState> emit) async {
    emit(
      state.copyWith(
        homeRecs: state.homeRecs.copyWith(isLoading: true, error: null),
        ecoRecs: state.ecoRecs.copyWith(isLoading: true, error: null),
      ),
    );

    final results = await Future.wait([
      _service.getHomeRecommendations(limit: 10),
      _service.getEcoRecommendations(limit: 10),
    ]);

    final homeRes = results[0];
    final ecoRes = results[1];

    emit(
      state.copyWith(
        homeRecs: MlSectionState(
          data: homeRes.data ?? const [],
          isLoading: false,
          error: homeRes.isSuccess ? null : homeRes.message,
        ),
        ecoRecs: MlSectionState(
          data: ecoRes.data ?? const [],
          isLoading: false,
          error: ecoRes.isSuccess ? null : ecoRes.message,
        ),
      ),
    );
  }
}
