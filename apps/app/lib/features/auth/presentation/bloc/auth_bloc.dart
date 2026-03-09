import 'package:app/features/auth/auth_service.dart';
import 'package:app/features/auth/data/model/dto/login_dto.dart';
import 'package:app/features/auth/data/model/dto/verify_email_dto.dart';
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
      emit(AuthError(loginResponse.message));
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
      emit(AuthError(meResponse.message));
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

    final response = await authService.resendOtp(event.email, event.type);

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

    await AuthStorage.clear();
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

  /// LOGOUT
  Future<void> _onLogout(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await AuthStorage.clear();
    emit(AuthUnauthenticated());
  }
}
