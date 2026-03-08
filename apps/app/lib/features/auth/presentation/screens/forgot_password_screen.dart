import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/auth/auth_service.dart';
import 'package:app/features/auth/presentation/widgets/form_forgot_password.dart';
import 'package:flutter/material.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {

  bool isLoading = false;
  String? errorMessage;

  Future<void> handleSubmit(String email) async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    final response = await AuthService.forgotPassword(email);

    setState(() {
      isLoading = false;
    });

    if (response.isSuccess) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Link reset password telah dikirim"),
        ),
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
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 500),
            child:Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Image.asset(
                  "assets/images/logo.png",
                  height: 200,
                ),
                const Text(
                  "Masukkan email akun kamu untuk menerima otp reset password.",
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey,
                  ),
                ),
                FormForgotPassword(
                  onSubmit: handleSubmit,
                  isLoading: isLoading,
                  errorMessage: errorMessage,
                ),
              ],
            )
          ),
        ),
      ),
    );
  }
}