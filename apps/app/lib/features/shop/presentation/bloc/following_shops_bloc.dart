import 'package:Greenly/features/shop/domain/data/shop_data.dart';
import 'package:Greenly/features/shop/service/shop_service.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'following_shops_event.dart';
part 'following_shops_state.dart';

class FollowingShopsBloc
    extends Bloc<FollowingShopsEvent, FollowingShopsState> {
  final ShopService _service;

  FollowingShopsBloc(this._service) : super(const FollowingShopsState()) {
    on<FollowingShopsRequested>(_onRequested);
    on<FollowingShopsLoadMoreRequested>(_onLoadMore);
  }

  Future<void> _onRequested(
    FollowingShopsRequested event,
    Emitter<FollowingShopsState> emit,
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

    final res = await _service.getFollowingShops(page: 1);
    final lastPage = res.metaData?.lastPage ?? 1;

    emit(
      state.copyWith(
        isLoading: false,
        data: res.data ?? [],
        page: 1,
        hasReachedMax: 1 >= lastPage,
        error: res.isSuccess ? null : res.message,
      ),
    );
  }

  Future<void> _onLoadMore(
    FollowingShopsLoadMoreRequested event,
    Emitter<FollowingShopsState> emit,
  ) async {
    if (state.isLoadingMore || state.isLoading || state.hasReachedMax) return;

    emit(state.copyWith(isLoadingMore: true));

    final nextPage = state.page + 1;
    final res = await _service.getFollowingShops(page: nextPage);
    final lastPage = res.metaData?.lastPage ?? nextPage;

    emit(
      state.copyWith(
        isLoadingMore: false,
        data: List.of(state.data)..addAll(res.data ?? []),
        page: nextPage,
        hasReachedMax: nextPage >= lastPage,
        error: res.isSuccess ? null : res.message,
      ),
    );
  }
}
