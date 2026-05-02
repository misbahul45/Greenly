import 'package:equatable/equatable.dart';

enum OtpType {
  verifyEmail,
  forgotPassword,
}
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

class AuthVerifyPasswordRequested extends AuthEvent {
  final String otp;

  const AuthVerifyPasswordRequested(this.otp);

  @override
  List<Object?> get props => [otp];
}

class AuthResendOtpRequested extends AuthEvent {
  final String email;
  final OtpType type;

  const AuthResendOtpRequested(this.email, this.type);

  @override
  List<Object?> get props => [email, type];
}

class AuthForgotPasswordRequested extends AuthEvent {
  final String email;

  const AuthForgotPasswordRequested(this.email);
  @override
  List<Object?> get props => [email];
}

class AuthChangePasswordRequested extends AuthEvent {
  final String tokenId;
  final String newPassword;
  final String confirmPassword;

  const AuthChangePasswordRequested(
    this.tokenId,
    this.newPassword,
    this.confirmPassword,
  );

  @override
  List<Object?> get props => [tokenId, newPassword, confirmPassword];
}
