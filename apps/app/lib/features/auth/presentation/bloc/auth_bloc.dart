import 'package:app/features/auth/auth_service.dart';
import 'package:app/features/auth/data/model/dto/change_password_dto.dart';
import 'package:app/features/auth/data/model/dto/forgot_password_dto.dart';
import 'package:app/features/auth/data/model/dto/login_dto.dart';
import 'package:app/features/auth/data/model/dto/verify_email_dto.dart';
import 'package:app/features/auth/data/model/dto/verify_password_dto.dart';
import 'package:app/features/auth/presentation/bloc/auth_event.dart';
import 'package:app/features/auth/presentation/bloc/auth_state.dart';
import 'package:app/features/auth/presentation/bloc/auth_storage.dart';
import 'package:app/shared/model/data/token_model.dart';
import 'package:app/shared/services/me_service.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthService authService;

  AuthBloc(this.authService) : super(AuthInitial()) {
    on<AuthLoginRequested>(_onLogin);
    on<AuthVerifyEmailRequested>(_onVerifyEmail);
    on<AuthLogoutRequested>(_onLogout);
    on<AuthCheckRequested>(_onCheckAuth);
    on<AuthResendOtpRequested>(_onResendOtp);
    on<AuthForgotPasswordRequested>(_onForgotPassword);
    on<AuthVerifyPasswordRequested>(_onVerifyPassword);
    on<AuthChangePasswordRequested>(_onChangePassword);
  }

  /// LOGIN
  Future<void> _onLogin(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    final loginResponse = await authService.login(
      LoginDto(email: event.email, password: event.password),
    );

    if (!loginResponse.isSuccess || loginResponse.data == null) {
      emit(AuthError(loginResponse.message, email: event.email));
      return;
    }

    final loginData = loginResponse.data!.data;

    /// SAVE TOKENS
    await AuthStorage.saveTokens(
      accessToken: loginData.tokens.accessToken,
      refreshToken: loginData.tokens.refreshToken,
    );

    /// GET USER
    final meResponse = await MeService.getMe();

    if (!meResponse.isSuccess || meResponse.data == null) {
      emit(AuthError(meResponse.message, email: event.email));
      return;
    }

    final user = meResponse.data!;

    await AuthStorage.saveUser(user);

    emit(AuthAuthenticated(user: user, tokens: loginData.tokens));
  }

  /// VERIFY EMAIL (OTP)
  Future<void> _onVerifyEmail(
    AuthVerifyEmailRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    final response = await authService.verifyEmail(
      VerifyEmailDto(token: event.otp),
    );

    if (!response.isSuccess || response.data == null) {
      emit(AuthError(response.message));
      return;
    }

    final verifyData = response.data!.data;

    /// SAVE TOKENS
    await AuthStorage.saveTokens(
      accessToken: verifyData.tokens.accessToken,
      refreshToken: verifyData.tokens.refreshToken,
    );

    /// GET USER
    final meResponse = await MeService.getMe();

    if (!meResponse.isSuccess || meResponse.data == null) {
      emit(AuthError(meResponse.message));
      return;
    }

    final user = meResponse.data!;

    await AuthStorage.saveUser(user);

    emit(AuthAuthenticated(user: user, tokens: verifyData.tokens));
  }

  // resend otp
  Future<void> _onResendOtp(
    AuthResendOtpRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    final typeString = event.type == OtpType.verifyEmail
        ? "VERIFY_EMAIL"
        : "RESET_PASSWORD";

    final response = await authService.resendOtp(event.email, typeString);

    if (!response.isSuccess) {
      emit(AuthError(response.message));
      return;
    }

    emit(AuthOtpResent());
  }

  /// CHECK AUTH (APP START)
  Future<void> _onCheckAuth(
    AuthCheckRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    AuthStorage.clear();
    final token = await AuthStorage.getAccessToken();
    final refreshToken = await AuthStorage.getRefreshToken();
    final user = await AuthStorage.getUser();
    if (token != null && refreshToken != null && user != null) {
      emit(
        AuthAuthenticated(
          user: user,
          tokens: TokenModel(accessToken: token, refreshToken: refreshToken),
        ),
      );
    } else {
      emit(AuthUnauthenticated());
    }
  }

  ///forgotPassword
  Future<void> _onForgotPassword(
    AuthForgotPasswordRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    final response = await authService.forgotPassword(
      ForgotPasswordDto(email: event.email),
    );

    if (!response.isSuccess) {
      emit(AuthError(response.message, email: event.email));
      return;
    }
    emit(AuthForgotPasswordSuccess());
  }

  Future<void> _onVerifyPassword(
    AuthVerifyPasswordRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    final response = await authService.verifyPassword(
      VerifyPasswordDto(token: event.otp),
    );

    final tokenId = response.data?.id;

    if (!response.isSuccess || tokenId == null) {
      emit(AuthError(response.message));
      return;
    }

    emit(TokenResetPassword(tokenId));
  }

  Future<void> _onChangePassword(
    AuthChangePasswordRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    final response = await authService.changePassword(
      ChangePasswordDto(
        tokenId: event.tokenId,
        newPassword: event.newPassword,
        confirmNewPassword: event.confirmPassword,
      ),
    );

    if (response.isSuccess) {
      emit(AuthChangePasswordSuccess());
    }
    
  }

  Future<void> _onLogout(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    await authService.logout();
    await AuthStorage.clear();
    emit(AuthUnauthenticated());
  }
}
