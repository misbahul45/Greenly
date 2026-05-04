part of 'favorite_bloc.dart';

abstract class FavoriteEvent extends Equatable {
  const FavoriteEvent();
  @override
  List<Object?> get props => [];
}

class FavoriteCheckRequested extends FavoriteEvent {
  final String productId;
  const FavoriteCheckRequested({required this.productId});
  @override
  List<Object?> get props => [productId];
}

class FavoriteToggleRequested extends FavoriteEvent {
  final String productId;
  const FavoriteToggleRequested({required this.productId});
  @override
  List<Object?> get props => [productId];
}

class FavoriteListRequested extends FavoriteEvent {}

class FavoriteLoadMoreRequested extends FavoriteEvent {}
