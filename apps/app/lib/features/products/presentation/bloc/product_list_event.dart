part of 'product_list_bloc.dart';

abstract class ProductListEvent extends Equatable {
  const ProductListEvent();
  @override
  List<Object?> get props => [];
}

class ProductListRequested extends ProductListEvent {
  final String? categoryId;
  final String? shopId;
  final String? search;

  const ProductListRequested({this.categoryId, this.shopId, this.search});

  @override
  List<Object?> get props => [categoryId, shopId, search];
}

class ProductListLoadMoreRequested extends ProductListEvent {}
