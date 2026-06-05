part of 'shop_detail_bloc.dart';

abstract class ShopDetailEvent extends Equatable {
  const ShopDetailEvent();
  @override
  List<Object?> get props => [];
}

class ShopDetailRequested extends ShopDetailEvent {
  final String shopId;
  final bool initiallyFollowing;

  const ShopDetailRequested(this.shopId, {this.initiallyFollowing = false});

  @override
  List<Object?> get props => [shopId, initiallyFollowing];
}

class ShopFollowToggled extends ShopDetailEvent {}
