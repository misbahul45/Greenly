import 'package:app/features/auth/auth_service.dart';
import 'package:app/features/auth/data/model/dto/login_dto.dart';
import 'package:app/features/auth/presentation/bloc/auth_event.dart';
import 'package:app/features/auth/presentation/bloc/auth_state.dart';
import 'package:app/features/auth/presentation/bloc/auth_storage.dart';
import 'package:app/shared/model/token_model.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthService authService;

  AuthBloc(this.authService) : super(AuthInitial()) {
    on<AuthLoginRequested>(_onLogin);
    on<AuthLogoutRequested>(_onLogout);
    on<AuthCheckRequested>(_onCheckAuth);
  }

  Future<void> _onLogin(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    final response = await AuthService.login(
      LoginDto(email: event.email, password: event.password),
    );
    print("LOGIN RESPONSE Data -> ${response.data}");

    if (response.isSuccess && response.data != null) {
      final loginData = response.data!.data;

      /// SAVE SECURELY
      await AuthStorage.saveTokens(
        accessToken: loginData.tokens.accessToken,
        refreshToken: loginData.tokens.refreshToken,
      );

      await AuthStorage.saveUser(loginData.user);

      emit(AuthAuthenticated(user: loginData.user, tokens: loginData.tokens));
    } else {
      emit(AuthError(response.message));
    }
  }

  Future<void> _onCheckAuth(
    AuthCheckRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    await AuthStorage.clear();
    final token = await AuthStorage.getAccessToken();
    final refreshToken = await AuthStorage.getRefreshToken();

    final user = await AuthStorage.getUser();

    if (token != null && user != null) {
      emit(
        AuthAuthenticated(
          user: user,
          tokens: TokenModel(
            accessToken: token,
            refreshToken: refreshToken!, 
          ),
        ),
      );
    } else {
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onLogout(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await AuthStorage.clear();
    emit(AuthUnauthenticated());
  }
}
