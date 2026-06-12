import 'package:app/features/review/domain/data/my_review_data.dart';
import 'package:app/features/review/service/review_service.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'my_reviews_event.dart';
part 'my_reviews_state.dart';

class MyReviewsBloc extends Bloc<MyReviewsEvent, MyReviewsState> {
  final ReviewService _service;

  MyReviewsBloc(this._service) : super(const MyReviewsState()) {
    on<MyReviewsRequested>(_onRequested);
    on<MyReviewsLoadMoreRequested>(_onLoadMore);
    on<MyReviewDeleteRequested>(_onDelete);
  }

  Future<void> _onRequested(
    MyReviewsRequested event,
    Emitter<MyReviewsState> emit,
  ) async {
    emit(
      state.copyWith(
        isLoading: true,
        items: [],
        page: 1,
        hasReachedMax: false,
        error: null,
      ),
    );

    final res = await _service.getMyReviews(page: 1);

    emit(
      state.copyWith(
        isLoading: false,
        items: res.items,
        page: res.page,
        hasReachedMax: !res.hasMore,
      ),
    );
  }

  Future<void> _onLoadMore(
    MyReviewsLoadMoreRequested event,
    Emitter<MyReviewsState> emit,
  ) async {
    if (state.isLoadingMore || state.isLoading || state.hasReachedMax) return;

    emit(state.copyWith(isLoadingMore: true));

    final res = await _service.getMyReviews(page: state.page + 1);

    emit(
      state.copyWith(
        isLoadingMore: false,
        items: [...state.items, ...res.items],
        page: res.page,
        hasReachedMax: !res.hasMore,
      ),
    );
  }

  Future<void> _onDelete(
    MyReviewDeleteRequested event,
    Emitter<MyReviewsState> emit,
  ) async {
    final res = await _service.delete(event.reviewId);
    if (res.isSuccess) {
      emit(
        state.copyWith(
          items: state.items
              .where((e) => e.review.id != event.reviewId)
              .toList(),
        ),
      );
    } else {
      emit(state.copyWith(error: res.message));
    }
  }
}
