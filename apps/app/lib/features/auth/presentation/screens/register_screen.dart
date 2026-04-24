import 'package:app/core/constants/ui_constants.dart';
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
        arguments: {"type": OtpType.verifyEmail},
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
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          Positioned(
            top: -60,
            left: -60,
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
            bottom: -80,
            right: -40,
            child: Container(
              width: UIConstants.decorCircleLarge,
              height: UIConstants.decorCircleLarge,
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
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        const SizedBox(height: UIConstants.spacingXXL),
                        Image.asset(
                          UIConstants.logoPath,
                          height: UIConstants.logoHeight,
                        ),
                        const SizedBox(height: UIConstants.spacingXXL),
                        FormRegister(
                          isLoading: isLoading,
                          errorMessage: errorMessage,
                          onSubmit: handleRegister,
                        ),
                        const SizedBox(height: UIConstants.spacingXXL),
                      ],
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
