import 'package:Greenly/features/Main/features/home/domains/data/product_data.dart';
import 'package:Greenly/features/products/service/product_list_service.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'product_list_event.dart';
part 'product_list_state.dart';

class ProductListBloc extends Bloc<ProductListEvent, ProductListState> {
  final ProductListService _service;

  ProductListBloc(this._service) : super(const ProductListState()) {
    on<ProductListRequested>(_onRequested);
    on<ProductListLoadMoreRequested>(_onLoadMore);
  }

  Future<void> _onRequested(
    ProductListRequested event,
    Emitter<ProductListState> emit,
  ) async {
    emit(
      state.copyWith(
        isLoading: true,
        data: [],
        page: 1,
        hasReachedMax: false,
        categoryId: event.categoryId,
        shopId: event.shopId,
        search: event.search,
        error: null,
      ),
    );

    final res = await _service.getProducts(
      page: 1,
      categoryId: event.categoryId,
      shopId: event.shopId,
      search: event.search,
    );
    final meta = res.metaData;
    final page = meta?.page ?? 1;
    final lastPage = meta?.lastPage ?? 1;

    emit(
      state.copyWith(
        isLoading: false,
        data: res.data?.data ?? [],
        page: page,
        hasReachedMax: page >= lastPage,
        error: res.isSuccess ? null : res.message,
      ),
    );
  }

  Future<void> _onLoadMore(
    ProductListLoadMoreRequested event,
    Emitter<ProductListState> emit,
  ) async {
    if (state.isLoadingMore || state.isLoading || state.hasReachedMax) return;

    emit(state.copyWith(isLoadingMore: true));

    final nextPage = state.page + 1;
    final res = await _service.getProducts(
      page: nextPage,
      categoryId: state.categoryId,
      shopId: state.shopId,
      search: state.search,
    );
    final lastPage = res.metaData?.lastPage ?? nextPage;

    emit(
      state.copyWith(
        isLoadingMore: false,
        data: List.of(state.data)..addAll(res.data?.data ?? []),
        page: nextPage,
        hasReachedMax: nextPage >= lastPage,
        error: res.isSuccess ? null : res.message,
      ),
    );
  }
}
