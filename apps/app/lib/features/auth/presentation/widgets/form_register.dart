import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/auth/auth_validation.dart';
import 'package:app/shared/ui/text_validation.dart';
import 'package:flutter/material.dart';

class FormRegister extends StatefulWidget {
  final void Function(
    String name,
    String email,
    String password,
    String confirmPassword,
  )
  onSubmit;
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
    if (!_formKey.currentState!.validate()) return;
    if (!isAgree) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            "Kamu harus menyetujui syarat & ketentuan",
            style: TextStyle(fontSize: 15),
          ),
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

  void togglePassword() => setState(() => obscurePassword = !obscurePassword);
  void toggleConfirmPassword() =>
      setState(() => obscureConfirmPassword = !obscureConfirmPassword);
  void goToLogin() => Navigator.pushNamed(context, "/login");

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
              'Buat Akun',
              style: TextStyle(
                fontSize: UIConstants.fontSizeXXL,
                fontWeight: FontWeight.w800,
                color: Colors.black87,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: UIConstants.spacingXS),
            Text(
              'Bergabung dan mulai belanja eco-friendly',
              style: TextStyle(
                fontSize: UIConstants.fontSizeM,
                color: Colors.grey[500],
              ),
            ),
            const SizedBox(height: UIConstants.spacingXXL),
            if (widget.errorMessage != null) ...[
              Container(
                padding: const EdgeInsets.all(UIConstants.paddingM),
                margin: const EdgeInsets.only(bottom: UIConstants.spacingL),
                width: double.infinity,
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
            _FieldLabel('Nama Lengkap'),
            const SizedBox(height: UIConstants.spacingXS),
            TextValidation(
              hint: "Masukkan nama lengkap",
              controller: nameController,
              prefixIcon: Icons.person_outline_rounded,
              validator: AuthValidation.name,
            ),
            const SizedBox(height: UIConstants.spacingL),
            _FieldLabel('Email'),
            const SizedBox(height: UIConstants.spacingXS),
            TextValidation(
              hint: "contoh@email.com",
              controller: emailController,
              prefixIcon: Icons.email_outlined,
              validator: AuthValidation.email,
            ),
            const SizedBox(height: UIConstants.spacingL),
            _FieldLabel('Password'),
            const SizedBox(height: UIConstants.spacingXS),
            TextValidation(
              hint: "Min. 8 karakter",
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
            const SizedBox(height: UIConstants.spacingL),
            _FieldLabel('Konfirmasi Password'),
            const SizedBox(height: UIConstants.spacingXS),
            TextValidation(
              hint: "Ulangi password",
              controller: confirmPasswordController,
              prefixIcon: Icons.lock_outline_rounded,
              obscure: obscureConfirmPassword,
              validator: (value) => AuthValidation.confirmPassword(
                value,
                passwordController.text,
              ),
              suffixIcon: IconButton(
                onPressed: toggleConfirmPassword,
                icon: Icon(
                  obscureConfirmPassword
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  size: UIConstants.iconSizeM,
                  color: Colors.grey,
                ),
              ),
            ),
            const SizedBox(height: UIConstants.spacingL),
            GestureDetector(
              onTap: () => setState(() => isAgree = !isAgree),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 24,
                    height: 24,
                    child: Checkbox(
                      value: isAgree,
                      activeColor: AppTheme.primaryColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(
                          UIConstants.radiusS / 2,
                        ),
                      ),
                      onChanged: (value) =>
                          setState(() => isAgree = value ?? false),
                    ),
                  ),
                  const SizedBox(width: UIConstants.spacingM),
                  Expanded(
                    child: RichText(
                      text: TextSpan(
                        style: TextStyle(
                          fontSize: UIConstants.fontSizeM,
                          color: Colors.grey[600],
                        ),
                        children: const [
                          TextSpan(text: 'Saya menyetujui '),
                          TextSpan(
                            text: 'Syarat & Ketentuan',
                            style: TextStyle(
                              color: AppTheme.primaryColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: UIConstants.spacingXXL),
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
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          "Buat Akun",
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
                  "Sudah punya akun?",
                  style: TextStyle(
                    fontSize: UIConstants.fontSizeM,
                    color: Colors.grey[600],
                  ),
                ),
                TextButton(
                  onPressed: goToLogin,
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: UIConstants.spacingXS,
                    ),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text(
                    "Masuk",
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
        fontSize: UIConstants.fontSizeM,
        fontWeight: FontWeight.w600,
        color: Colors.black87,
      ),
    );
  }
}
