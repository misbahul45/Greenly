import 'package:app/shared/model/data/role_model.dart';

class UserData {
  final int id;
  final String name;
  final String email;
  final List<RoleModel> roles;

  UserData({
    required this.id,
    required this.name,
    required this.email,
    required this.roles,
  });

  factory UserData.fromJson(Map<String, dynamic> json) {
    return UserData(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      roles: (json['roles'] as List)
          .map((e) => RoleModel.fromJson(e))
          .toList(),
    );
  }
}