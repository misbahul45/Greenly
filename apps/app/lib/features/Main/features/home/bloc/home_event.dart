import 'package:equatable/equatable.dart';

class HomeEvent extends Equatable {
  const HomeEvent();

  @override
  List<Object?> get props => [];
}

class GetActiveBannersRequested extends HomeEvent {}

class GetCategoriesRequested extends HomeEvent {}

class GetLoadMoreCategoriesRequested extends HomeEvent {}

class GetFeaturedProductsRequested extends HomeEvent {}

class LoadMoreProductsRequested extends HomeEvent {}