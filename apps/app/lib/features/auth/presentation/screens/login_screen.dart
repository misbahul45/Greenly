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
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.backgroundGradient),
        child: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 600),
              child: SingleChildScrollView(
                child: BlocConsumer<AuthBloc, AuthState>(
                  listener: (context, state) {
                    if (state is AuthAuthenticated) {
                      Navigator.pushReplacementNamed(context, "/home");
                    }
                    if (state is AuthError) {
                        if (state.message.contains('Please verify') && state.email != null) {
                          context.read<AuthBloc>().add(
                            AuthResendOtpRequested(
                              state.email!, OtpType.verifyEmail 
                            ),
                          );

                          Navigator.pushNamed(
                            context,
                            "/verify-email",
                            arguments: {
                              "type": OtpType.verifyEmail,
                            },                         
                          );
                        }
                     }
                    },
                  builder: (context, state) {
                    final isLoading = state is AuthLoading;
                    String? errorMessage;

                    if (state is AuthError) {
                      errorMessage = state.message;
                    }
                    return Padding(
                      padding: const EdgeInsets.all(6),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Image.asset("assets/images/logo.png", height: 200),
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
                        ],
                      ),
                    );
                  },
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
