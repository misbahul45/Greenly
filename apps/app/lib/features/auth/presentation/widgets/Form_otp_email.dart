import 'package:app/features/auth/auth_validation.dart';
import 'package:app/shared/ui/TextValidation.dart';
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

  /// VERIFY OTP
  void handleSubmitOtp() {
    if (otpController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("OTP harus diisi"),
        ),
      );
      return;
    }

    widget.onSubmitOtp(
      otpController.text.trim(),
    );
  }

  /// RESEND OTP
  void handleResend() {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    widget.onResendOtp(
      emailController.text.trim(),
    );

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

            /// OTP VIEW
            if (showOtp) ...[
              OtpField(
                length: 6,
                onCompleted: (value) {
                  otpController.text = value;
                },
              ),

              const SizedBox(height: 20),

              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: widget.isLoading ? null : handleSubmitOtp,
                  child: widget.isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                          ),
                        )
                      : const Text("Verify OTP"),
                ),
              ),

              const SizedBox(height: 10),

              TextButton(
                onPressed: toggleView,
                child: const Text("Resend Code"),
              ),
            ]

            /// EMAIL VIEW
            else ...[
              Textvalidation(
                hint: "Email",
                controller: emailController,
                validator: AuthValidation.email,
                prefixIcon: Icons.email,
              ),

              const SizedBox(height: 20),

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
                          ),
                        )
                      : const Text("Send OTP"),
                ),
              ),

              const SizedBox(height: 10),

              TextButton(
                onPressed: toggleView,
                child: const Text("Back to OTP"),
              ),
            ],
          ],
        ),
      ),
    );
  }
}