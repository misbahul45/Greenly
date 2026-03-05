import 'package:app/features/auth/auth_service.dart';
import 'package:app/features/auth/data/model/dto/verify_email_dto.dart';
import 'package:app/features/auth/presentation/widgets/Form_otp_email.dart';
import 'package:flutter/material.dart';

class VerifyEmailScreen extends StatefulWidget {
  const VerifyEmailScreen({super.key});

  @override
  State<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends State<VerifyEmailScreen> {

  bool isLoading = false;
  String? errorMessage;

  /// VERIFY OTP
  Future<void> handleVerifyOtp(String otp) async {

    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    final response = await AuthService.verifyEmail(
      VerifyEmailDto(token: otp),
    );

    setState(() {
      isLoading = false;
    });

    if (response.isSuccess) {

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Email berhasil diverifikasi"),
        ),
      );

      Navigator.pushReplacementNamed(context, "/login");

    } else {

      setState(() {
        errorMessage = response.message;
      });

    }
  }

  /// RESEND OTP
  Future<void> handleResendOtp(String email) async {

    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    final response = await AuthService.resendOtp(email);

    setState(() {
      isLoading = false;
    });

    if (response.isSuccess) {

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("OTP berhasil dikirim ulang"),
        ),
      );

    } else {

      setState(() {
        errorMessage = response.message;
      });

    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [

                  /// TITLE
                  const Text(
                    "Verify Email",
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 8),

                  /// SUBTITLE
                  const Text(
                    "Masukkan kode OTP yang dikirim ke email kamu",
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey,
                    ),
                  ),

                  const SizedBox(height: 32),

                  /// FORM OTP
                  FormOtpEmail(
                    isLoading: isLoading,
                    errorMessage: errorMessage,
                    onSubmitOtp: handleVerifyOtp,
                    onResendOtp: handleResendOtp,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}