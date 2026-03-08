import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class AuthLoginRequested extends AuthEvent {
  final String email;
  final String password;

  const AuthLoginRequested({required this.email, required this.password});

  @override
  List<Object?> get props => [email, password];
}

class AuthCheckRequested extends AuthEvent {}

class AuthLogoutRequested extends AuthEvent {}

class AuthVerifyEmailRequested extends AuthEvent {
  final String otp;

  const AuthVerifyEmailRequested(this.otp);

  @override
  List<Object?> get props => [otp];
}

class AuthResendOtpRequested extends AuthEvent {
  final String email;
  final String type;

  const AuthResendOtpRequested(this.email, this.type);

  @override
  List<Object?> get props => [email, type];
}