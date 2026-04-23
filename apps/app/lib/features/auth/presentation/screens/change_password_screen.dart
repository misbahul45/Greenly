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
      body: Center(
        child:ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),      
            child:  BlocConsumer<AuthBloc, AuthState>(
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
                return FormChangePassword(
                  isLoading: state is AuthLoading,
                  errorMessage: null,
                  onSubmit: (tokenId, password, confirmPassword) {
                    context.read<AuthBloc>().add(
                          AuthChangePasswordRequested(
                            state.tokenId,
                            password,
                            confirmPassword
                          ),
                        );
                  },
                );
              }

              if (state is AuthLoading) {
                return const CircularProgressIndicator();
              }

              return const Text("Token tidak ditemukan");
            },
          ),
        )
      ),
    );
  }
}