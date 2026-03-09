import 'package:app/features/auth/auth_validation.dart';
import 'package:app/shared/ui/text_validation.dart';
import 'package:flutter/material.dart';

class FormForgotPassword extends StatefulWidget {
  final void Function(String email) onSubmit;
  final bool isLoading;
  final String? errorMessage;

  const FormForgotPassword({
    super.key,
    required this.onSubmit,
    this.isLoading = false,
    this.errorMessage,
  });

  @override
  State<FormForgotPassword> createState() => _FormForgotPasswordState();
}

class _FormForgotPasswordState extends State<FormForgotPassword> {
  final _formKey = GlobalKey<FormState>();
  final emailController = TextEditingController();

  @override
  void dispose() {
    emailController.dispose();
    super.dispose();
  }

  void handleSubmit() {
    if (!_formKey.currentState!.validate()) return;

    widget.onSubmit(emailController.text.trim());
  }

  void goToLogin() {
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (widget.errorMessage != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.red.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  widget.errorMessage!,
                  style: const TextStyle(color: Colors.red),
                ),
              ),

            TextValidation(
              hint: 'Email',
              controller: emailController,
              prefixIcon: Icons.email,
              validator: AuthValidation.email,
            ),

            const SizedBox(height: 20),

            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: widget.isLoading ? null : handleSubmit,
                child: widget.isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text("Send Reset OTP"),
              ),
            ),

            const SizedBox(height: 10),

            TextButton(
              onPressed: goToLogin,
              child: const Text("Back to login"),
            ),
          ],
        ),
      ),
    );
  }
}