import 'package:app/features/auth/auth_service.dart';
import 'package:app/features/auth/data/model/dto/register_dto.dart';
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

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Register berhasil"),
        ),
      );

      Navigator.pushReplacementNamed(context, "/verify-email");

    } else {

      setState(() {
        errorMessage = response.message;
      });

    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [

                  /// TITLE
                  const Text(
                    "Greenly Mart",
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 8),

                  /// SUBTITLE
                  const Text(
                    "Buat akun baru untuk melanjutkan",
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey,
                    ),
                  ),

                  const SizedBox(height: 32),

                  /// FORM REGISTER
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
    );
  }
}