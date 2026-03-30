import 'package:app/features/auth/auth_validation.dart';
import 'package:app/shared/ui/TextValidation.dart';
import 'package:flutter/material.dart';

class FormRegister extends StatefulWidget {
  const FormRegister({super.key});

  @override
  State<FormRegister> createState() => _FormRegisterState();
}

class _FormRegisterState extends State<FormRegister> {
  final _formKey = GlobalKey<FormState>();

  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmPasswordController = TextEditingController();
  final nameController=TextEditingController();

  bool obscurePassword = true;
  bool obscureConfirmPassword = true;
  bool isAgree = false;

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    confirmPasswordController.dispose();
    super.dispose(); // ✅ jangan lupa
  }

  void handleSubmit() {
    if (!_formKey.currentState!.validate()) {
      print("Form Tidak Valid ❌");
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

    print("Form Valid ✅");
    print("Email: ${emailController.text}");
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

  void toggleLogin() {
    Navigator.pushNamed(context, '/login');
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
            /// Name
            Textvalidation(
              hint: "Fullname", 
              controller: nameController,
              prefixIcon: Icons.account_balance_rounded,
              validator: AuthValidation.name,
            ),
                    
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
                  obscurePassword ? Icons.visibility : Icons.visibility_off,
                ),
              ),
            ),

            const SizedBox(height: 16),

            /// CONFIRM PASSWORD
            Textvalidation(
              hint: "Confirm Password",
              controller: confirmPasswordController,
              obscure: obscureConfirmPassword,
              prefixIcon: Icons.lock_outline,
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

            /// AGREEMENT CHECKBOX
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
                  child: Text("Saya menyetujui syarat & ketentuan"),
                ),
              ],
            ),

            const SizedBox(height: 16),

            /// REGISTER BUTTON
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: handleSubmit,
                child: const Text("Create Account"),
              ),
            ),

            const SizedBox(height: 18),

            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text("Have an account"),
                TextButton(onPressed: toggleLogin, child: const Text("Login")),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
