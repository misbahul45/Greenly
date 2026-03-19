class ChangePasswordDto {
  final String tokenId;
  final String newPassword;
  final String confirmNewPassword;

  ChangePasswordDto({
    required this.tokenId,
    required this.newPassword,
    required this.confirmNewPassword,
  });

  Map<String, dynamic> toJson() => {
    "tokenId": tokenId,
    "newPassword":newPassword,
    "confirmNewPassword":confirmNewPassword
  };
}
