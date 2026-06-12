part of 'my_reviews_bloc.dart';

abstract class MyReviewsEvent extends Equatable {
  const MyReviewsEvent();

  @override
  List<Object?> get props => [];
}

class MyReviewsRequested extends MyReviewsEvent {
  const MyReviewsRequested();
}

class MyReviewsLoadMoreRequested extends MyReviewsEvent {
  const MyReviewsLoadMoreRequested();
}

class MyReviewDeleteRequested extends MyReviewsEvent {
  final String reviewId;

  const MyReviewDeleteRequested(this.reviewId);

  @override
  List<Object?> get props => [reviewId];
}
