import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/auth/auth_service.dart';
import 'package:app/features/auth/data/model/dto/register_dto.dart';
import 'package:app/features/auth/presentation/bloc/auth_event.dart';
import 'package:app/features/auth/presentation/widgets/form_register.dart';
import 'package:flutter/material.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  bool isLoading = false;
  String? errorMessage;

  Future<void> handleRegister(
    String name,
    String email,
    String password,
    String confirmPassword,
  ) async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    final response = await AuthService.register(
      RegisterDto(
        name: name,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      ),
    );

    setState(() {
      isLoading = false;
    });

    if (response.isSuccess) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Register berhasil")));

      await Future.delayed(const Duration(seconds: 2));

      if (!mounted) return;

      Navigator.pushNamed(
        context, 
        "/verify-email",
        arguments: {
          "type": OtpType.verifyEmail,
        },  
      );
    } else {
      setState(() {
        errorMessage = response.message;
      });
    }
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
                  padding: const EdgeInsets.all(6),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Image.asset(
                        "assets/images/logo.png",
                        height: 200,
                      ),
                      const SizedBox(height: 16),
                      FormRegister(
                        isLoading: isLoading,
                        errorMessage: errorMessage,
                        onSubmit: handleRegister,
                      ),
                    ],
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