import 'package:equatable/equatable.dart';

abstract class HomeMlEvent extends Equatable {
  const HomeMlEvent();

  @override
  List<Object?> get props => [];
}

class HomeMlStarted extends HomeMlEvent {}

class HomeMlRefreshed extends HomeMlEvent {}
