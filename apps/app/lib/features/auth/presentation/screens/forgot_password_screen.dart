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
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: BlocConsumer<AuthBloc, AuthState>(
          listener: (context, state) {
            if (state is AuthError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.message)),
              );
              if (state.message.contains('Please verify') && state.email != null) {
                context.read<AuthBloc>().add(
                  AuthResendOtpRequested(
                    state.email!,OtpType.verifyEmail 
                  ),
                );

                Navigator.pushNamed(
                  context,
                  "/verify-email",
                  arguments:{
                    "email": state.email,
                    "type": OtpType.verifyEmail,
                  },
                );
              }
            }

            if(state is AuthForgotPasswordSuccess){
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
                  arguments:{
                    "type": OtpType.forgotPassword,
                  },
                );
              }
          },
          builder: (context, state) {
            final isLoading = state is AuthLoading;
            String? errorMessage;

            if (state is AuthError) {
              errorMessage = state.message;
            }

            return Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 600),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      /// LOGO
                      Image.asset(
                        "assets/images/logo.png",
                        height: 200,
                      ),

                      const SizedBox(height: 20),

                      /// TEXT
                      SizedBox(
                        width: double.infinity,
                        child: Text(
                          "Masukkan email akun kamu untuk menerima OTP reset password.",
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey,
                          ),
                        ),
                      ),

                      const SizedBox(height: 30),

                      /// FORM
                      FormForgotPassword(
                        onSubmit: (email) {
                          context.read<AuthBloc>().add(
                                AuthForgotPasswordRequested(email),
                              );
                        },
                        isLoading: isLoading,
                        errorMessage: errorMessage,
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}