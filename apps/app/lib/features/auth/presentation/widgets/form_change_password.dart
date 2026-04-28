import 'package:app/features/auth/auth_validation.dart';
import 'package:app/shared/widgets/text_validation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:app/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:app/features/auth/presentation/bloc/auth_state.dart';

class FormChangePassword extends StatefulWidget {
  final void Function(
    String tokenId,
    String newPassword,
    String confirmNewPassword,
  )
  onSubmit;
  final bool isLoading;
  final String? errorMessage;

  const FormChangePassword({
    super.key,
    required this.onSubmit,
    required this.isLoading,
    this.errorMessage,
  });

  @override
  State<FormChangePassword> createState() => _FormChangePasswordState();
}

class _FormChangePasswordState extends State<FormChangePassword> {
  final _formKey = GlobalKey<FormState>();

  final newPasswordController = TextEditingController();
  final confirmNewPasswordController = TextEditingController();

  bool obscurePassword = true;
  bool obscureConfirmPassword = true;

  @override
  void dispose() {
    newPasswordController.dispose();
    confirmNewPasswordController.dispose();
    super.dispose();
  }

  void handleSubmit() {
    if (!_formKey.currentState!.validate()) return;

    final state = context.read<AuthBloc>().state;

    if (state is TokenResetPassword) {
      widget.onSubmit(
        state.tokenId,
        newPasswordController.text.trim(),
        confirmNewPasswordController.text.trim(),
      );
    }
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
    return Form(
      key: _formKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (widget.errorMessage != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.error_outline_rounded,
                    color: Colors.red[400],
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      widget.errorMessage!,
                      style: TextStyle(color: Colors.red[700], fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
          ],
          _FieldLabel('Password Baru'),
          const SizedBox(height: 6),
          TextValidation(
            hint: 'Min. 8 karakter',
            controller: newPasswordController,
            obscure: obscurePassword,
            prefixIcon: Icons.lock_outline_rounded,
            validator: AuthValidation.password,
            suffixIcon: IconButton(
              onPressed: togglePassword,
              icon: Icon(
                obscurePassword
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
                size: 20,
                color: Colors.grey,
              ),
            ),
          ),
          const SizedBox(height: 16),
          _FieldLabel('Konfirmasi Password Baru'),
          const SizedBox(height: 6),
          TextValidation(
            controller: confirmNewPasswordController,
            obscure: obscureConfirmPassword,
            hint: 'Ulangi password baru',
            prefixIcon: Icons.lock_outline_rounded,
            validator: (value) => AuthValidation.confirmPassword(
              value,
              newPasswordController.text,
            ),
            suffixIcon: IconButton(
              onPressed: toggleConfirmPassword,
              icon: Icon(
                obscureConfirmPassword
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
                size: 20,
                color: Colors.grey,
              ),
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: widget.isLoading ? null : handleSubmit,
              child: widget.isLoading
                  ? const CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    )
                  : const Text(
                      "Ubah Password",
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 12),
          Center(
            child: TextButton(
              onPressed: goToLogin,
              child: Text(
                "Kembali ke Login",
                style: TextStyle(color: Colors.grey[500], fontSize: 13),
              ),
            ),
          ),
        ],
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
