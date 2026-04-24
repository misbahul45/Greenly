import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/auth/auth_validation.dart';
import 'package:app/shared/ui/text_validation.dart';
import 'package:flutter/material.dart';
import 'package:app/shared/ui/otp_field.dart';

class FormOtpEmail extends StatefulWidget {
  final void Function(String otp) onSubmitOtp;
  final void Function(String email) onResendOtp;
  final bool isLoading;
  final String? errorMessage;

  const FormOtpEmail({
    super.key,
    required this.onSubmitOtp,
    required this.onResendOtp,
    required this.isLoading,
    this.errorMessage,
  });

  @override
  State<FormOtpEmail> createState() => _FormOtpEmailState();
}

class _FormOtpEmailState extends State<FormOtpEmail> {
  final _formKey = GlobalKey<FormState>();
  final otpController = TextEditingController();
  final emailController = TextEditingController();
  bool showOtp = true;

  @override
  void dispose() {
    otpController.dispose();
    emailController.dispose();
    super.dispose();
  }

  void handleSubmitOtp() {
    if (otpController.text.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("OTP tidak valid")),
      );
      return;
    }
    widget.onSubmitOtp(otpController.text.trim());
  }

  void handleResend() {
    if (!_formKey.currentState!.validate()) return;
    widget.onResendOtp(emailController.text.trim());
    setState(() {
      showOtp = true;
    });
  }

  void toggleView() {
    setState(() {
      showOtp = !showOtp;
    });
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final maxWidth = constraints.maxWidth;
        final horizontalPadding = 8.0;
        final totalSpacing = 5 * 8.0;
        final fieldWidth =
            ((maxWidth - horizontalPadding * 2 - totalSpacing) / 6)
                .clamp(40.0, 56.0);

        return Form(
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
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          widget.errorMessage!,
                          style: TextStyle(
                            color: Colors.red[700],
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              if (showOtp) ...[
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: horizontalPadding,
                    vertical: 20,
                  ),
                  decoration: BoxDecoration(
                    color: AppTheme.tertiaryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color:
                          AppTheme.tertiaryColor.withValues(alpha: 0.3),
                    ),
                  ),
                  child: OtpField(
                    length: 6,
                    onCompleted: (value) {
                      otpController.text = value;
                    },
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: widget.isLoading ? null : handleSubmitOtp,
                    child: widget.isLoading
                        ? const SizedBox(
                            width: 12,
                            height: 12,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text(
                            "Verifikasi OTP",
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () {
                          Navigator.pop(context);
                        },
                        child: const Text("Kembali"),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextButton(
                        onPressed: toggleView,
                        child: const Text(
                          "Kirim Ulang",
                          style: TextStyle(
                            color: AppTheme.primaryColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ] else ...[
                _FieldLabel('Email'),
                const SizedBox(height: 6),
                TextValidation(
                  hint: "contoh@email.com",
                  controller: emailController,
                  validator: AuthValidation.email,
                  prefixIcon: Icons.email_outlined,
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: widget.isLoading ? null : handleResend,
                    child: widget.isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text(
                            "Kirim OTP",
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
                    onPressed: toggleView,
                    child: Text(
                      "Kembali ke OTP",
                      style: TextStyle(
                        color: Colors.grey[500],
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}

class _FieldLabel extends StatelessWidget {
  final String text;
  const _FieldLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: Colors.black87,
        ),
      ),
    );
  }
}