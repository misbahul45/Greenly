import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:app/features/auth/presentation/bloc/auth_event.dart';
import 'package:app/features/auth/presentation/bloc/auth_state.dart';
import 'package:app/features/auth/presentation/widgets/Form_otp_email.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class VerifyEmailScreen extends StatelessWidget {
  const VerifyEmailScreen({super.key});

  /// VERIFY OTP
  void handleVerifyOtp(BuildContext context, String otp) {
    context.read<AuthBloc>().add(
          AuthVerifyEmailRequested(otp),
        );
  }

  /// RESEND OTP
  void handleResendOtp(BuildContext context, String email, OtpType type) {
    context.read<AuthBloc>().add(
          AuthResendOtpRequested(email, type),
        );
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 600),
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: BlocConsumer<AuthBloc, AuthState>(
                    listener: (context, state) {
                      /// SUCCESS VERIFY
                      if (state is AuthAuthenticated) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text("Email berhasil diverifikasi"),
                          ),
                        );

                        Navigator.pushReplacementNamed(context, "/home");
                      }

                      /// OTP RESENT
                      if (state is AuthOtpResent) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text("OTP berhasil dikirim ulang"),
                          ),
                        );
                      }

                      /// ERROR
                      if (state is AuthError) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(state.message),
                          ),
                        );
                      }
                    },
                    builder: (context, state) {
                      final isLoading = state is AuthLoading;

                      return Column(
                        children: [
                          /// TITLE
                          const Text(
                            "Verify Email",
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                            ),
                          ),

                          const SizedBox(height: 8),

                          /// SUBTITLE
                          const Text(
                            "Masukkan kode OTP yang dikirim ke email kamu",
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.grey,
                            ),
                          ),

                          const SizedBox(height: 32),

                          /// FORM OTP
                          FormOtpEmail(
                            isLoading: isLoading,
                            errorMessage:
                                state is AuthError ? state.message : null,
                            onSubmitOtp: (otp) =>
                                handleVerifyOtp(context, otp),
                            onResendOtp: (email) =>
                                handleResendOtp(context, email, OtpType.verifyEmail),
                          ),
                        ],
                      );
                    },
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}