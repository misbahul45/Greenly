import 'package:flutter/material.dart';

class Textvalidation extends StatelessWidget {
  final String hint;
  final TextEditingController controller;
  final bool obscure;
  final String? Function(String?)? validator;

  final IconData? prefixIcon;  
  final Widget? suffixIcon;    

  const Textvalidation({
    super.key,
    required this.hint,
    required this.controller,
    this.obscure = false,
    this.validator,
    this.prefixIcon,
    this.suffixIcon,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      obscureText: obscure,
      validator: validator,

      autovalidateMode: AutovalidateMode.onUserInteraction,

      decoration: InputDecoration(
        hintText: hint,
        border: const OutlineInputBorder(),
        prefixIcon: prefixIcon != null ? Icon(prefixIcon) : null,
        suffixIcon: suffixIcon,
      ),
    );
  }
}