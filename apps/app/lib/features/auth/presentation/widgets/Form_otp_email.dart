import 'package:app/features/auth/auth_validation.dart';
import 'package:app/shared/ui/TextValidation.dart';
import 'package:flutter/material.dart';
import 'package:app/shared/ui/otp_field.dart';

class FormOtpEmail extends StatefulWidget {
  const FormOtpEmail({super.key});

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
    print("OTP: ${otpController.text}");
  }

  void handleResend() {
    if (_formKey.currentState!.validate()) {
      print("Resend to: ${emailController.text}");
      setState(() {
        showOtp = true;
      });
    }
  }

  void toggleView() {
    setState(() {
      showOtp = !showOtp;
    });
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

            /// 🔹 OTP VIEW
            if (showOtp) ...[
              OtpField(
                length: 6,
                onCompleted: (value) {
                  otpController.text = value;
                },
              ),

              const SizedBox(height: 16),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: handleSubmitOtp,
                  child: const Text("Verify OTP"),
                ),
              ),
              TextButton(
                onPressed: toggleView,
                child: const Text("Resend Code"),
              ),
            ]

            /// 🔹 EMAIL INPUT VIEW
            else ...[
              Textvalidation(
                hint: "Email", 
                controller: emailController,
                validator: AuthValidation.email,
                prefixIcon: Icons.email,
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: handleResend,
                  child: const Text("Send OTP"),
                ),
              ),
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