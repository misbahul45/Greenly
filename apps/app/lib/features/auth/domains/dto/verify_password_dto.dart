class VerifyPasswordDto {
  final String token;

  VerifyPasswordDto({required this.token});

  Map<String, dynamic> toJson() => {"token": token};
}
