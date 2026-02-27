class AuthValidation {

  static String? required(String? value, String fieldName) {
    if (value == null || value.trim().isEmpty) {
      return "$fieldName wajib diisi";
    }
    return null;
  }

  static String? email(String? value) {
    final requiredCheck = required(value, "Email");
    if (requiredCheck != null) return requiredCheck;

    final emailRegex = RegExp(r'^[^@]+@[^@]+\.[^@]+$');
    if (!emailRegex.hasMatch(value!.trim())) {
      return "Email tidak valid";
    }

    return null;
  }
  static String? name(String? value) {
    final requiredCheck = required(value, "Nama");
    if (requiredCheck != null) return requiredCheck;

    if (value!.length < 3) {
      return "Nama minimal 3 karakter";
    }

    return null;
  }

  static String? password(String? value) {
    final requiredCheck = required(value, "Password");
    if (requiredCheck != null) return requiredCheck;

    if (value!.length < 8) {
      return "Password minimal 8 karakter";
    }

    if (!RegExp(r'[A-Z]').hasMatch(value)) {
      return "Password harus mengandung huruf besar";
    }

    if (!RegExp(r'[0-9]').hasMatch(value)) {
      return "Password harus mengandung angka";
    }

    return null;
  }

  static String? confirmPassword(String? value, String password) {
    final requiredCheck = required(value, "Konfirmasi password");
    if (requiredCheck != null) return requiredCheck;

    if (value != password) {
      return "Password tidak sama";
    }

    return null;
  }

  static String? otp(String? value, {int length = 6}) {
    final requiredCheck = required(value, "OTP");
    if (requiredCheck != null) return requiredCheck;

    if (!RegExp(r'^[0-9]+$').hasMatch(value!)) {
      return "OTP hanya boleh angka";
    }

    if (value.length != length) {
      return "OTP harus $length digit";
    }

    return null;
  }
}