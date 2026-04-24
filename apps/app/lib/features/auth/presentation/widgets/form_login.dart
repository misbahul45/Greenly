import 'package:flutter/material.dart';
import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/auth/auth_validation.dart';
import 'package:app/shared/ui/text_validation.dart';

class FormLogin extends StatefulWidget {
  final void Function(String email, String password) onSubmit;
  final bool isLoading;
  final String? errorMessage;

  const FormLogin({
    super.key,
    required this.onSubmit,
    required this.isLoading,
    this.errorMessage,
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
      padding: const EdgeInsets.only(top: UIConstants.spacingXXL),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Selamat Datang',
              style: TextStyle(
                fontSize: UIConstants.fontSizeXXL,
                fontWeight: FontWeight.w800,
                color: Colors.black87,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: UIConstants.spacingXS),
            Text(
              'Masuk ke akunmu',
              style: TextStyle(
                fontSize: UIConstants.fontSizeM,
                color: Colors.grey[500],
              ),
            ),
            const SizedBox(height: UIConstants.spacingXXL),
            _FieldLabel('Email'),
            const SizedBox(height: UIConstants.spacingXS),
            TextValidation(
              hint: "Email",
              controller: emailController,
              prefixIcon: Icons.email_outlined,
              validator: AuthValidation.email,
            ),
            const SizedBox(height: UIConstants.spacingL),
            _FieldLabel('Password'),
            const SizedBox(height: UIConstants.spacingXS),
            TextValidation(
              hint: "Password",
              controller: passwordController,
              prefixIcon: Icons.lock_outline_rounded,
              obscure: obscurePassword,
              validator: AuthValidation.password,
              suffixIcon: IconButton(
                onPressed: togglePassword,
                icon: Icon(
                  obscurePassword
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  size: UIConstants.iconSizeM,
                  color: Colors.grey,
                ),
              ),
            ),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: toggleForgotPassword,
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Text(
                  "Lupa password?",
                  style: TextStyle(
                    fontSize: UIConstants.fontSizeM,
                    color: AppTheme.primaryColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            const SizedBox(height: UIConstants.spacingS),
            if (widget.errorMessage != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(UIConstants.paddingM),
                margin: const EdgeInsets.only(bottom: UIConstants.spacingM),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(UIConstants.radiusM),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.error_outline_rounded,
                      color: Colors.red[400],
                      size: UIConstants.iconSizeS,
                    ),
                    const SizedBox(width: UIConstants.spacingS),
                    Expanded(
                      child: Text(
                        widget.errorMessage!,
                        style: TextStyle(
                          color: Colors.red[700],
                          fontSize: UIConstants.fontSizeM,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            SizedBox(
              width: double.infinity,
              height: UIConstants.buttonHeight,
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
                          "Masuk",
                          key: ValueKey("text"),
                          style: TextStyle(
                            fontSize: UIConstants.fontSizeL,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                ),
              ),
            ),
            const SizedBox(height: UIConstants.spacingXL),
            Row(
              children: [
                Expanded(child: Divider(color: Colors.grey[200])),
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: UIConstants.spacingM,
                  ),
                  child: Text(
                    'atau',
                    style: TextStyle(
                      fontSize: UIConstants.fontSizeS,
                      color: Colors.grey[400],
                    ),
                  ),
                ),
                Expanded(child: Divider(color: Colors.grey[200])),
              ],
            ),
            const SizedBox(height: UIConstants.spacingL),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  "Belum punya akun?",
                  style: TextStyle(
                    fontSize: UIConstants.fontSizeM,
                    color: Colors.grey[600],
                  ),
                ),
                TextButton(
                  onPressed: toggleRegister,
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: UIConstants.spacingXS,
                    ),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text(
                    "Daftar sekarang",
                    style: TextStyle(
                      fontSize: UIConstants.fontSizeM,
                      color: AppTheme.primaryColor,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  final String text;
  const _FieldLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: Colors.black87,
      ),
    );
  }
}
