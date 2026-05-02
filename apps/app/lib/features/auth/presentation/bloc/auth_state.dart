import 'package:app/shared/model/data/token_model.dart';
import 'package:app/shared/model/data/user_model.dart';
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
  final String? email;

  const AuthError(this.message, {this.email});

  @override
  List<Object?> get props => [message, email];
}

class AuthOtpResent extends AuthState {}

class AuthForgotPasswordSuccess extends AuthState {}

class TokenResetPassword extends AuthState {
  final String tokenId;

  const TokenResetPassword(this.tokenId);

  @override
  List<Object?> get props => [tokenId];
}

class AuthChangePasswordSuccess extends AuthState{}
