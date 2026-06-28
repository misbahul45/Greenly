part of 'order_bloc.dart';

abstract class OrderEvent extends Equatable {
  const OrderEvent();
  @override
  List<Object?> get props => [];
}

class OrderListRequested extends OrderEvent {
  final String? status;
  const OrderListRequested({this.status});
  @override
  List<Object?> get props => [status];
}

class OrderLoadMoreRequested extends OrderEvent {}

class OrderDetailRequested extends OrderEvent {
  final String orderId;
  const OrderDetailRequested(this.orderId);
  @override
  List<Object?> get props => [orderId];
}

class OrderCancelRequested extends OrderEvent {
  final String orderId;
  const OrderCancelRequested(this.orderId);
  @override
  List<Object?> get props => [orderId];
}
