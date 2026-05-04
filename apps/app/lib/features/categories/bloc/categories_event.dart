part of 'categories_bloc.dart';

abstract class AllCategoriesEvent extends Equatable {
  const AllCategoriesEvent();
  @override
  List<Object?> get props => [];
}

class AllCategoriesRequested extends AllCategoriesEvent {}

class AllCategoriesLoadMoreRequested extends AllCategoriesEvent {}
