part of 'following_shops_bloc.dart';

abstract class FollowingShopsEvent extends Equatable {
  const FollowingShopsEvent();
  @override
  List<Object?> get props => [];
}

class FollowingShopsRequested extends FollowingShopsEvent {}

class FollowingShopsLoadMoreRequested extends FollowingShopsEvent {}
