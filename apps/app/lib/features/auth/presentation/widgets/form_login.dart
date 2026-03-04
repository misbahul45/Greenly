import 'package:flutter/material.dart';
import 'package:app/features/auth/auth_validation.dart';
import 'package:app/shared/ui/TextValidation.dart';

class FormLogin extends StatefulWidget {
  final void Function(String email, String password) onSubmit;
  final bool isLoading;

  const FormLogin({
    super.key,
    required this.onSubmit,
    required this.isLoading,
  });

  @override
  State<FormLogin> createState() => _FormLoginState();
}

class _FormLoginState extends State<FormLogin> {
  final _formKey = GlobalKey<FormState>();

  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  bool obscurePassword = true;

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  void handleSubmit() {
    if (!_formKey.currentState!.validate()) return;

    widget.onSubmit(
      emailController.text.trim(),
      passwordController.text.trim(),
    );
  }

  void togglePassword() {
    setState(() {
      obscurePassword = !obscurePassword;
    });
  }

  void toggleForgotPassword() {
    Navigator.pushNamed(context, "/forgot-password");
  }

  void toggleRegister() {
    Navigator.pushNamed(context, "/register");
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
            /// EMAIL
            Textvalidation(
              hint: "Email",
              controller: emailController,
              prefixIcon: Icons.email,
              validator: AuthValidation.email,
            ),

            const SizedBox(height: 16),

            /// PASSWORD
            Textvalidation(
              hint: "Password",
              controller: passwordController,
              prefixIcon: Icons.lock,
              obscure: obscurePassword,
              validator: AuthValidation.password,
              suffixIcon: IconButton(
                onPressed: togglePassword,
                icon: Icon(
                  obscurePassword
                      ? Icons.visibility
                      : Icons.visibility_off,
                ),
              ),
            ),

            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: toggleForgotPassword,
                child: const Text("Forgot password?"),
              ),
            ),

            const SizedBox(height: 16),

            /// BUTTON WITH LOADING
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: widget.isLoading ? null : handleSubmit,
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: widget.isLoading
                      ? const SizedBox(
                          key: ValueKey("loading"),
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          "My Account",
                          key: ValueKey("text"),
                        ),
                ),
              ),
            ),

            const SizedBox(height: 16),

            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text("Don't have an account?"),
                TextButton(
                  onPressed: toggleRegister,
                  child: const Text("Create account"),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}