part of 'cart_bloc.dart';

abstract class CartEvent extends Equatable {
  const CartEvent();
  @override
  List<Object?> get props => [];
}

class CartLoadRequested extends CartEvent {}

class CartAddItemRequested extends CartEvent {
  final String productId;
  final int quantity;
  const CartAddItemRequested({required this.productId, this.quantity = 1});
  @override
  List<Object?> get props => [productId, quantity];
}

class CartUpdateItemRequested extends CartEvent {
  final String productId;
  final int quantity;
  const CartUpdateItemRequested({
    required this.productId,
    required this.quantity,
  });
  @override
  List<Object?> get props => [productId, quantity];
}

class CartRemoveItemRequested extends CartEvent {
  final String productId;
  const CartRemoveItemRequested({required this.productId});
  @override
  List<Object?> get props => [productId];
}

class CartClearRequested extends CartEvent {}
