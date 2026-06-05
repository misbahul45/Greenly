import 'package:app/features/favorite/domain/data/favorite_data.dart';
import 'package:app/features/favorite/service/favorite_service.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

part 'favorite_event.dart';
part 'favorite_state.dart';

class FavoriteBloc extends Bloc<FavoriteEvent, FavoriteState> {
  final FavoriteService _service;

  FavoriteBloc(this._service) : super(const FavoriteState()) {
    on<FavoriteCheckRequested>(_onCheck);
    on<FavoriteToggleRequested>(_onToggle);
    on<FavoriteListRequested>(_onList);
    on<FavoriteLoadMoreRequested>(_onLoadMore);
  }

  Future<void> _onCheck(
    FavoriteCheckRequested event,
    Emitter<FavoriteState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, productId: event.productId));
    final res = await _service.check(productId: event.productId);
    if (res.isSuccess && res.data != null) {
      emit(state.copyWith(isLoading: false, isFavorite: res.data!.isFavorite));
    } else {
      emit(state.copyWith(isLoading: false));
    }
  }

  Future<void> _onToggle(
    FavoriteToggleRequested event,
    Emitter<FavoriteState> emit,
  ) async {
    final optimistic = !state.isFavorite;
    emit(state.copyWith(isFavorite: optimistic, isToggling: true));
    final res = await _service.toggle(productId: event.productId);
    if (res.isSuccess && res.data != null) {
      emit(state.copyWith(isFavorite: res.data!.isFavorite, isToggling: false));
    } else {
      emit(
        state.copyWith(
          isFavorite: !optimistic,
          isToggling: false,
          error: res.message,
        ),
      );
    }
  }

  Future<void> _onList(
    FavoriteListRequested event,
    Emitter<FavoriteState> emit,
  ) async {
    emit(
      state.copyWith(
        isListLoading: true,
        favorites: [],
        listPage: 1,
        listHasReachedMax: false,
      ),
    );
    final result = await _service.getUserFavorites(page: 1);
    emit(
      state.copyWith(
        isListLoading: false,
        favorites: result.items,
        listPage: result.page,
        listHasReachedMax: !result.hasMore,
        totalFavorites: result.total,
      ),
    );
  }

  Future<void> _onLoadMore(
    FavoriteLoadMoreRequested event,
    Emitter<FavoriteState> emit,
  ) async {
    if (state.isListLoadingMore || state.listHasReachedMax) return;
    emit(state.copyWith(isListLoadingMore: true));
    final nextPage = state.listPage + 1;
    final result = await _service.getUserFavorites(page: nextPage);
    emit(
      state.copyWith(
        isListLoadingMore: false,
        favorites: [...state.favorites, ...result.items],
        listPage: result.page,
        listHasReachedMax: !result.hasMore,
      ),
    );
  }
}
