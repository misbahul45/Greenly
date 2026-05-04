import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:app/features/product-detail/bloc/product_detail_event.dart';
import 'package:app/features/product-detail/bloc/product_detail_state.dart';
import 'package:app/features/product-detail/product_detail_service.dart';

class ProductDetailBloc extends Bloc<ProductDetailEvent, ProductDetailState> {
  final ProductDetailService productDetailService;

  ProductDetailBloc({
    required this.productDetailService,
  }) : super(const ProductDetailState()) {
    on<GetDetailProduct>(_onGetDetailProduct);
  }

  Future<void> _onGetDetailProduct(
    GetDetailProduct event,
    Emitter<ProductDetailState> emit,
  ) async {
    emit(state.copyWith(
      product: state.product.copyWith(
        isLoading: true,
        message: null,
      ),
      error: null,
    ));

    final res =
        await productDetailService.getProducts(slug: event.slug);

    emit(state.copyWith(
      product: state.product.copyWith(
        isLoading: false,
        data: res.data?.data,
        message: res.isSuccess ? res.message : null,
      ),
      error: res.isSuccess ? null : res.message,
    ));
  }
}