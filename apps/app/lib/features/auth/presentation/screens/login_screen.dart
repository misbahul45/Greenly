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
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            child: BlocConsumer<AuthBloc, AuthState>(
              listener: (context, state) {
                if (state is AuthAuthenticated) {
                  Navigator.pushReplacementNamed(context, "/home");
                }

                if (state is AuthError) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(state.message)),
                  );
                }
              },
              builder: (context, state) {
                final isLoading = state is AuthLoading;

                return FormLogin(
                  isLoading: isLoading,
                  onSubmit: (email, password) {
                    context.read<AuthBloc>().add(
                          AuthLoginRequested(
                            email: email,
                            password: password,
                          ),
                        );
                  },
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}