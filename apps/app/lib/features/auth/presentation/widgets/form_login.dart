import 'package:app/features/auth/auth_validation.dart';
import 'package:app/shared/ui/TextValidation.dart';
import 'package:flutter/material.dart';

class FormLogin extends StatefulWidget {
  const FormLogin({super.key});

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
    if (!_formKey.currentState!.validate()) {
      print("Form Tidak Valid ❌");
      return;
    }

    print("Login Valid ✅");
  }

  void togglePassword() {
    setState(() {
      obscurePassword = !obscurePassword;
    });
  }

  void toggleForgotPassword(){
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
                child: const Text("forgot password?")
              ),
            ),

            const SizedBox(height: 16),
      
            /// BUTTON
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: handleSubmit,
                child: const Text("My Account"),
              ),
            ),

            const SizedBox(height: 16),

            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text("Don't have an account?"),
                TextButton(onPressed: toggleRegister, child: const Text("Create account"))
              ],
            )
          ],
        ),
      ),
    );
  }
}