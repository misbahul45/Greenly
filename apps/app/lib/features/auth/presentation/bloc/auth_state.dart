import 'package:app/shared/model/token_model.dart';
import 'package:app/shared/model/user_model.dart';
import 'package:equatable/equatable.dart';

class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

// state login
class AuthAuthenticated extends AuthState {
  final UserModel user;
  final TokenModel tokens;

  const AuthAuthenticated({required this.user, required this.tokens});

  @override
  List<Object?> get props => [user, tokens];
}

// state anonymus
class AuthUnauthenticated extends AuthState {}

class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);

  @override
  List<Object?> get props => [message];
}
