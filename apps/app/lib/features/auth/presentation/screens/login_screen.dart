import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';
import '../widgets/form_login.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          Positioned(
            top: -60,
            right: -60,
            child: Container(
              width: UIConstants.decorCircleMedium,
              height: UIConstants.decorCircleMedium,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.tertiaryColor.withValues(alpha: 0.18),
              ),
            ),
          ),
          Positioned(
            top: 60,
            right: 20,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.primaryColor.withValues(alpha: 0.07),
              ),
            ),
          ),
          Positioned(
            bottom: -80,
            left: -40,
            child: Container(
              width: UIConstants.decorCircleLarge,
              height: UIConstants.decorCircleLarge,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.tertiaryColor.withValues(alpha: 0.12),
              ),
            ),
          ),
          SafeArea(
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(
                  maxWidth: UIConstants.maxContentWidth,
                ),
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  child: BlocConsumer<AuthBloc, AuthState>(
                    listener: (context, state) {
                      if (state is AuthAuthenticated) {
                        Navigator.pushReplacementNamed(context, AppRoutes.main);
                      }
                      if (state is AuthError) {
                        if (state.message.contains('Please verify') &&
                            state.email != null) {
                          context.read<AuthBloc>().add(
                            AuthResendOtpRequested(
                              state.email!,
                              OtpType.verifyEmail,
                            ),
                          );
                          Navigator.pushNamed(
                            context,
                            "/verify-email",
                            arguments: {"type": OtpType.verifyEmail},
                          );
                        }
                      }
                    },
                    builder: (context, state) {
                      final isLoading = state is AuthLoading;
                      String? errorMessage;
                      if (state is AuthError) errorMessage = state.message;
                      return Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: UIConstants.paddingL,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            const SizedBox(height: UIConstants.spacingXXL),
                            Image.asset(
                              UIConstants.logoPath,
                              height: UIConstants.logoHeight,
                            ),
                            const SizedBox(height: UIConstants.spacingXXL),
                            FormLogin(
                              isLoading: isLoading,
                              errorMessage: errorMessage,
                              onSubmit: (email, password) {
                                context.read<AuthBloc>().add(
                                  AuthLoginRequested(
                                    email: email,
                                    password: password,
                                  ),
                                );
                              },
                            ),
                            const SizedBox(height: UIConstants.spacingXXL),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
