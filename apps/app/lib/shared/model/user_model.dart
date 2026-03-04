import 'package:app/shared/model/role_model.dart';

class UserModel {
  final int id;
  final String name;
  final String email;
  final List<RoleModel> roles;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.roles,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      roles: (json['roles'] as List<dynamic>? ?? [])
          .map((role) => RoleModel.fromJson(role))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'roles': roles.map((role) => role.toJson()).toList(),
    };
  }
}