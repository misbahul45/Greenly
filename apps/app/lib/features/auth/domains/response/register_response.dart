class RegisterResponse {
  final String id;
  final String name;
  final String email;

  RegisterResponse({
    required this.id,
    required this.name,
    required this.email,
  });

  factory RegisterResponse.fromJson(Map<String, dynamic> json) {
    return RegisterResponse(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
    );
  }
}