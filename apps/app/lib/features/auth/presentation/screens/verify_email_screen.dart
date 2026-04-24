import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:app/features/auth/presentation/bloc/auth_event.dart';
import 'package:app/features/auth/presentation/bloc/auth_state.dart';
import 'package:app/features/auth/presentation/widgets/Form_otp_email.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class VerifyEmailScreen extends StatelessWidget {
  const VerifyEmailScreen({super.key});

  void handleVerifyOtp(BuildContext context, String otp) {
    context.read<AuthBloc>().add(AuthVerifyEmailRequested(otp));
  }

  void handleResendOtp(BuildContext context, String email, OtpType type) {
    context.read<AuthBloc>().add(AuthResendOtpRequested(email, type));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          Positioned(
            top: -50,
            right: -50,
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
                        if (state is AuthAuthenticated) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text("Email berhasil diverifikasi"),
                            ),
                          );
                          Navigator.pushReplacementNamed(context, "/home");
                        }
                        if (state is AuthOtpResent) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text("OTP berhasil dikirim ulang"),
                            ),
                          );
                        }
                        if (state is AuthError) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(state.message)),
                          );
                        }
                      },
                      builder: (context, state) {
                        final isLoading = state is AuthLoading;
                        return Column(
                          children: [
                            const SizedBox(height: UIConstants.spacingXXL),
                            _OtpIllustration(
                              icon: Icons.mark_email_read_rounded,
                              title: "Verify Email",
                              subtitle:
                                  "Masukkan kode OTP yang dikirim ke email kamu",
                            ),
                            const SizedBox(height: UIConstants.spacingXXXL),
                            FormOtpEmail(
                              isLoading: isLoading,
                              errorMessage: state is AuthError
                                  ? state.message
                                  : null,
                              onSubmitOtp: (otp) =>
                                  handleVerifyOtp(context, otp),
                              onResendOtp: (email) => handleResendOtp(
                                context,
                                email,
                                OtpType.verifyEmail,
                              ),
                            ),
                            const SizedBox(height: UIConstants.spacingXXL),
                          ],
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

class _OtpIllustration extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _OtpIllustration({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

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
              child: Icon(
                icon,
                color: Colors.white,
                size: UIConstants.otpIconSize,
              ),
            ),
          ],
        ),
        const SizedBox(height: UIConstants.spacingXL),
        Text(
          title,
          style: const TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w800,
            color: Colors.black87,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: UIConstants.spacingS),
        Text(
          subtitle,
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
