class ForgotPasswordDto {
  final String email;

  ForgotPasswordDto({
    required this.email,
  });

  Map<String, dynamic> toJson() => {
    "email": email,
  };
}