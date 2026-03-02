class RegisterDto {
  final String email;
  final String name;
  final String password;
  final String confirmPassword;

  RegisterDto({
    required this.email,
    required this.name,
    required this.password,
    required this.confirmPassword,
  });

  Map<String, dynamic> toJson() => {
    "name": name,
    "email": email,
    "password": password,
    "confirmPassword": confirmPassword,
  };
}
