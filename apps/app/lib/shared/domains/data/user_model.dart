import 'shop_model.dart';

class UserModel {
  final String id;
  final String name;
  final String email;
  final String status;
  final List<String> roles;
  final List<ShopModel> shops;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.status,
    required this.roles,
    required this.shops,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final profile = json['profile'];
    final fullName = profile is Map ? profile['fullName']?.toString() : null;
    return UserModel(
      id: json['id']?.toString() ?? '',
      name: fullName ?? json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      roles: List<String>.from(json['roles'] ?? []),
      shops: (json['shop'] as List<dynamic>? ?? [])
          .map((shop) => ShopModel.fromJson(shop as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'status': status,
      'roles': roles,
      'shops': shops.map((shop) => shop.toJson()).toList(),
    };
  }
}
