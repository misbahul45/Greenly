import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:app/shared/model/user_model.dart';

class AuthStorage {
  static const _storage = FlutterSecureStorage();

  static const _accessTokenKey = "access_token";
  static const _refreshTokenKey = "refresh_token";
  static const _userKey = "user_data";

  static Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(key: _accessTokenKey, value: accessToken);
    await _storage.write(key: _refreshTokenKey, value: refreshToken);
  }

  static Future<void> saveUser(UserModel user) async {
    await _storage.write(
      key: _userKey,
      value: jsonEncode(user.toJson()),
    );
  }

  static Future<String?> getAccessToken() async {
    return await _storage.read(key: _accessTokenKey);
  }

  static Future<UserModel?> getUser() async {
    final data = await _storage.read(key: _userKey);
    if (data == null) return null;

    return UserModel.fromJson(jsonDecode(data));
  }

  static Future<void> clear() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
    await _storage.delete(key: _userKey);
  }
}