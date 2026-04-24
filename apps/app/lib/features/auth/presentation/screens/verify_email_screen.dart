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
    final width = MediaQuery.of(context).size.width;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: width > 500 ? 420 : width,
            ),
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(
                horizontal: 20,
                vertical: 24,
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
                  } else if (state is AuthOtpResent) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text("OTP berhasil dikirim ulang"),
                      ),
                    );
                  } else if (state is AuthError) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(state.message)),
                    );
                  }
                },
                builder: (context, state) {
                  final isLoading = state is AuthLoading;

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const SizedBox(height: 24),
                      _OtpIllustration(
                        icon: Icons.mark_email_read_rounded,
                        title: "Verify Email",
                        subtitle:
                            "Masukkan kode OTP yang dikirim ke email kamu",
                      ),
                      const SizedBox(height: 36),
                      FormOtpEmail(
                        isLoading: isLoading,
                        errorMessage:
                            state is AuthError ? state.message : null,
                        onSubmitOtp: (otp) =>
                            handleVerifyOtp(context, otp),
                        onResendOtp: (email) => handleResendOtp(
                          context,
                          email,
                          OtpType.verifyEmail,
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  );
                },
              ),
            ),
          ),
        ),
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
        Container(
          width: 90,
          height: 88,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppTheme.primaryColor.withValues(alpha: 0.1),
          ),
          child: Icon(
            icon,
            size: 42,
            color: AppTheme.primaryColor,
          ),
        ),
        const SizedBox(height: 20),
        Text(
          title,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          subtitle,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey[600],
            height: 1.4,
          ),
        ),
      ],
    );
  }
}