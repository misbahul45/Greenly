import 'package:equatable/equatable.dart';

abstract class ProductDetailEvent extends Equatable {
  const ProductDetailEvent();

  @override
  List<Object?> get props => [];
}

class GetDetailProduct extends ProductDetailEvent {
  final String slug;
  const GetDetailProduct({required this.slug});

  @override
  List<Object?> get props => [slug];
}

class GetProductReviewsRequested extends ProductDetailEvent {
  final String productId;
  const GetProductReviewsRequested({required this.productId});

  @override
  List<Object?> get props => [productId];
}

class LoadMoreProductReviewsRequested extends ProductDetailEvent {}
