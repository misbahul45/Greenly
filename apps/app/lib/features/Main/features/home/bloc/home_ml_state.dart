import 'package:Greenly/features/ml-products/domain/ml_product_result.dart';

class MlSectionState {
  final List<MlProductResult> data;
  final bool isLoading;
  final String? error;

  const MlSectionState({
    this.data = const [],
    this.isLoading = false,
    this.error,
  });

  MlSectionState copyWith({
    List<MlProductResult>? data,
    bool? isLoading,
    String? error,
  }) {
    return MlSectionState(
      data: data ?? this.data,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class HomeMlState {
  final MlSectionState homeRecs;
  final MlSectionState ecoRecs;

  const HomeMlState({
    this.homeRecs = const MlSectionState(),
    this.ecoRecs = const MlSectionState(),
  });

  HomeMlState copyWith({MlSectionState? homeRecs, MlSectionState? ecoRecs}) {
    return HomeMlState(
      homeRecs: homeRecs ?? this.homeRecs,
      ecoRecs: ecoRecs ?? this.ecoRecs,
    );
  }
}
