class VerifyEmailDto {
  final String token;

  VerifyEmailDto({required this.token});

  Map<String, dynamic> toJson() => {"token": token};
}
