import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:app/features/auth/presentation/bloc/auth_event.dart';
import 'package:app/features/auth/presentation/bloc/auth_state.dart';
import 'package:app/features/auth/presentation/widgets/form_forgot_password.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          Positioned(
            top: -40,
            right: -40,
            child: Container(
              width: UIConstants.decorCircleSmall,
              height: UIConstants.decorCircleSmall,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.tertiaryColor.withValues(alpha: 0.18),
              ),
            ),
          ),
          Positioned(
            bottom: -60,
            left: -30,
            child: Container(
              width: UIConstants.decorCircleMedium,
              height: UIConstants.decorCircleMedium,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.tertiaryColor.withValues(alpha: 0.12),
              ),
            ),
          ),
          SafeArea(
            child: BlocConsumer<AuthBloc, AuthState>(
              listener: (context, state) {
                if (state is AuthError) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text(state.message)));
                  if (state.message.contains('Please verify') &&
                      state.email != null) {
                    context.read<AuthBloc>().add(
                      AuthResendOtpRequested(state.email!, OtpType.verifyEmail),
                    );
                    Navigator.pushNamed(
                      context,
                      "/verify-email",
                      arguments: {
                        "email": state.email,
                        "type": OtpType.verifyEmail,
                      },
                    );
                  }
                }
                if (state is AuthForgotPasswordSuccess) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text(
                        "OTP reset password telah dikirim ke email kamu",
                      ),
                    ),
                  );
                  Navigator.pushNamed(
                    context,
                    "/verify-password",
                    arguments: {"type": OtpType.forgotPassword},
                  );
                }
              },
              builder: (context, state) {
                final isLoading = state is AuthLoading;
                String? errorMessage;
                if (state is AuthError) errorMessage = state.message;
                return Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(
                      maxWidth: UIConstants.maxContentWidth,
                    ),
                    child: SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: UIConstants.paddingL,
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const SizedBox(height: UIConstants.spacingXXL),
                            Image.asset(
                              UIConstants.logoPath,
                              height: UIConstants.logoHeight,
                            ),
                            const SizedBox(height: UIConstants.spacingL),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(
                                horizontal: UIConstants.paddingM,
                                vertical: UIConstants.paddingM,
                              ),
                              decoration: BoxDecoration(
                                color: AppTheme.tertiaryColor.withValues(
                                  alpha: 0.15,
                                ),
                                borderRadius: BorderRadius.circular(
                                  UIConstants.radiusL,
                                ),
                                border: Border.all(
                                  color: AppTheme.tertiaryColor.withValues(
                                    alpha: 0.4,
                                  ),
                                ),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 36,
                                    height: 36,
                                    decoration: BoxDecoration(
                                      color: AppTheme.primaryColor.withValues(
                                        alpha: 0.1,
                                      ),
                                      borderRadius: BorderRadius.circular(
                                        UIConstants.radiusM,
                                      ),
                                    ),
                                    child: const Icon(
                                      Icons.lock_reset_rounded,
                                      color: AppTheme.primaryColor,
                                      size: 18,
                                    ),
                                  ),
                                  const SizedBox(width: UIConstants.spacingM),
                                  const Expanded(
                                    child: Text(
                                      "Masukkan email akun kamu untuk menerima OTP reset password.",
                                      style: TextStyle(
                                        fontSize: UIConstants.fontSizeM,
                                        color: Colors.black54,
                                        height: 1.5,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: UIConstants.spacingXL),
                            FormForgotPassword(
                              onSubmit: (email) {
                                context.read<AuthBloc>().add(
                                  AuthForgotPasswordRequested(email),
                                );
                              },
                              isLoading: isLoading,
                              errorMessage: errorMessage,
                            ),
                            const SizedBox(height: UIConstants.spacingXXL),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
