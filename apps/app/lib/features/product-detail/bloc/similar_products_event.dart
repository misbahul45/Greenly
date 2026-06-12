import 'package:equatable/equatable.dart';

abstract class SimilarProductsEvent extends Equatable {
  const SimilarProductsEvent();

  @override
  List<Object?> get props => [];
}

class SimilarProductsRequested extends SimilarProductsEvent {
  final String productId;

  const SimilarProductsRequested({required this.productId});

  @override
  List<Object?> get props => [productId];
}
