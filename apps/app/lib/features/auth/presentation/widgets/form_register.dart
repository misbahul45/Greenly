import 'package:app/features/auth/auth_validation.dart';
import 'package:app/shared/ui/TextValidation.dart';
import 'package:flutter/material.dart';

class FormRegister extends StatefulWidget {
  final void Function(
    String name,
    String email,
    String password,
    String confirmPassword,
  ) onSubmit;

  final bool isLoading;
  final String? errorMessage;

  const FormRegister({
    super.key,
    required this.onSubmit,
    required this.isLoading,
    this.errorMessage,
  });

  @override
  State<FormRegister> createState() => _FormRegisterState();
}

class _FormRegisterState extends State<FormRegister> {
  final _formKey = GlobalKey<FormState>();

  final nameController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmPasswordController = TextEditingController();

  bool obscurePassword = true;
  bool obscureConfirmPassword = true;
  bool isAgree = false;

  @override
  void dispose() {
    nameController.dispose();
    emailController.dispose();
    passwordController.dispose();
    confirmPasswordController.dispose();
    super.dispose();
  }

  void handleSubmit() {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (!isAgree) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Kamu harus menyetujui syarat & ketentuan"),
        ),
      );
      return;
    }

    widget.onSubmit(
      nameController.text.trim(),
      emailController.text.trim(),
      passwordController.text.trim(),
      confirmPasswordController.text.trim(),
    );
  }

  void togglePassword() {
    setState(() {
      obscurePassword = !obscurePassword;
    });
  }

  void toggleConfirmPassword() {
    setState(() {
      obscureConfirmPassword = !obscureConfirmPassword;
    });
  }

  void goToLogin() {
    Navigator.pushNamed(context, "/login");
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [

            /// ERROR MESSAGE
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

            /// FULLNAME
            Textvalidation(
              hint: "Fullname",
              controller: nameController,
              prefixIcon: Icons.person,
              validator: AuthValidation.name,
            ),

            const SizedBox(height: 16),

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

            const SizedBox(height: 16),

            /// CONFIRM PASSWORD
            Textvalidation(
              hint: "Confirm Password",
              controller: confirmPasswordController,
              prefixIcon: Icons.lock_outline,
              obscure: obscureConfirmPassword,
              validator: (value) => AuthValidation.confirmPassword(
                value,
                passwordController.text,
              ),
              suffixIcon: IconButton(
                onPressed: toggleConfirmPassword,
                icon: Icon(
                  obscureConfirmPassword
                      ? Icons.visibility
                      : Icons.visibility_off,
                ),
              ),
            ),

            const SizedBox(height: 16),

            /// AGREEMENT
            Row(
              children: [
                Checkbox(
                  value: isAgree,
                  onChanged: (value) {
                    setState(() {
                      isAgree = value ?? false;
                    });
                  },
                ),
                const Expanded(
                  child: Text(
                    "Saya menyetujui syarat & ketentuan",
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            /// REGISTER BUTTON
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: widget.isLoading ? null : handleSubmit,
                child: widget.isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                        ),
                      )
                    : const Text("Create Account"),
              ),
            ),

            const SizedBox(height: 18),

            /// LOGIN LINK
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text("Have an account?"),
                TextButton(
                  onPressed: goToLogin,
                  child: const Text("Login"),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}