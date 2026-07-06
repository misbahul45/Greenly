import 'package:Greenly/features/ml-products/service/ml_product_service.dart';
import 'package:Greenly/features/product-detail/bloc/similar_products_event.dart';
import 'package:Greenly/features/product-detail/bloc/similar_products_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class SimilarProductsBloc
    extends Bloc<SimilarProductsEvent, SimilarProductsState> {
  final MlProductService _service;

  SimilarProductsBloc(this._service) : super(const SimilarProductsState()) {
    on<SimilarProductsRequested>(_onRequested);
  }

  Future<void> _onRequested(
    SimilarProductsRequested event,
    Emitter<SimilarProductsState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, error: null));

    final res = await _service.getSimilarProducts(event.productId);

    emit(state.copyWith(
      isLoading: false,
      products: res.data ?? const [],
      error: res.isSuccess ? null : res.message,
    ));
  }
}
