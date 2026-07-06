import 'package:Greenly/features/Main/features/home/domains/data/category_data.dart';
import 'package:Greenly/features/Main/features/home/home_service.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'categories_event.dart';
part 'categories_state.dart';

class AllCategoriesBloc extends Bloc<AllCategoriesEvent, AllCategoriesState> {
  final HomeService _service;

  AllCategoriesBloc(this._service) : super(const AllCategoriesState()) {
    on<AllCategoriesRequested>(_onLoad);
    on<AllCategoriesLoadMoreRequested>(_onLoadMore);
  }

  Future<void> _onLoad(
    AllCategoriesRequested event,
    Emitter<AllCategoriesState> emit,
  ) async {
    emit(
      state.copyWith(
        isLoading: true,
        data: [],
        page: 1,
        hasReachedMax: false,
        error: null,
      ),
    );

    final res = await _service.getCategories(page: 1, limit: 20);
    final categories = res.data?.data ?? [];
    final meta = res.metaData;
    final page = meta?.page ?? 1;
    final lastPage = meta?.lastPage ?? 1;

    emit(
      state.copyWith(
        isLoading: false,
        data: categories,
        page: page,
        hasReachedMax: page >= lastPage,
        error: res.isSuccess ? null : res.message,
      ),
    );
  }

  Future<void> _onLoadMore(
    AllCategoriesLoadMoreRequested event,
    Emitter<AllCategoriesState> emit,
  ) async {
    if (state.isLoadingMore || state.isLoading || state.hasReachedMax) return;

    emit(state.copyWith(isLoadingMore: true));

    final nextPage = state.page + 1;
    final res = await _service.getCategories(page: nextPage, limit: 20);
    final newItems = res.data?.data ?? [];
    final meta = res.metaData;
    final lastPage = meta?.lastPage ?? nextPage;

    emit(
      state.copyWith(
        isLoadingMore: false,
        data: List.of(state.data)..addAll(newItems),
        page: nextPage,
        hasReachedMax: nextPage >= lastPage,
        error: res.isSuccess ? null : res.message,
      ),
    );
  }
}
