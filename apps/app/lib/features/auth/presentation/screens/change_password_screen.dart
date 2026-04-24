import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:app/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:app/features/auth/presentation/bloc/auth_event.dart';
import 'package:app/features/auth/presentation/bloc/auth_state.dart';
import 'package:app/features/auth/presentation/widgets/form_change_password.dart';

class ChangePasswordScreen extends StatelessWidget {
  const ChangePasswordScreen({super.key});

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
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: UIConstants.paddingL,
                    ),
                    child: BlocConsumer<AuthBloc, AuthState>(
                      listener: (context, state) {
                        if (state is AuthError) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(state.message)),
                          );
                        }
                        if (state is AuthChangePasswordSuccess) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text("Password berhasil diubah"),
                            ),
                          );
                          Navigator.pushNamedAndRemoveUntil(
                            context,
                            "/login",
                            (route) => false,
                          );
                        }
                      },
                      builder: (context, state) {
                        if (state is TokenResetPassword) {
                          return Column(
                            children: [
                              const SizedBox(height: UIConstants.spacingXXL),
                              _ChangePasswordHeader(),
                              const SizedBox(height: UIConstants.spacingXXXL),
                              FormChangePassword(
                                isLoading: state is AuthLoading,
                                errorMessage: null,
                                onSubmit: (tokenId, password, confirmPassword) {
                                  context.read<AuthBloc>().add(
                                    AuthChangePasswordRequested(
                                      state.tokenId,
                                      password,
                                      confirmPassword,
                                    ),
                                  );
                                },
                              ),
                              const SizedBox(height: UIConstants.spacingXXL),
                            ],
                          );
                        }
                        if (state is AuthLoading) {
                          return const Center(
                            child: CircularProgressIndicator(),
                          );
                        }
                        return Center(
                          child: Text(
                            "Token tidak ditemukan",
                            style: TextStyle(color: Colors.grey[500]),
                          ),
                        );
                      },
                    ),
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

class _ChangePasswordHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            Container(
              width: UIConstants.otpIconOuter,
              height: UIConstants.otpIconOuter,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.tertiaryColor.withValues(alpha: 0.25),
              ),
            ),
            Container(
              width: UIConstants.otpIconInner,
              height: UIConstants.otpIconInner,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.primaryColor,
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryColor.withValues(alpha: 0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: const Icon(
                Icons.lock_rounded,
                color: Colors.white,
                size: UIConstants.otpIconSize,
              ),
            ),
          ],
        ),
        const SizedBox(height: UIConstants.spacingXL),
        const Text(
          'Buat Password Baru',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w800,
            color: Colors.black87,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: UIConstants.spacingS),
        Text(
          'Password baru harus berbeda dari password sebelumnya',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: UIConstants.fontSizeL,
            color: Colors.grey[600],
            height: 1.5,
          ),
        ),
      ],
    );
  }
}
