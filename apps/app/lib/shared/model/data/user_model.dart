import 'shop_model.dart';

class UserModel {
  final int id;
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
    return UserModel(
      id: json['id'] ?? 0,
      name: json['profile']?['fullName'] ?? '',
      email: json['email'] ?? '',
      status: json['status'] ?? '',
      roles: List<String>.from(json['roles'] ?? []),
      shops: (json['shop'] as List<dynamic>? ?? [])
          .map((shop) => ShopModel.fromJson(shop))
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