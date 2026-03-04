import 'package:app/shared/model/token_model.dart';
import 'package:app/shared/model/user_model.dart';

class LoginData {
  final TokenModel tokens;
  final UserModel user;

  LoginData({
    required this.tokens,
    required this.user,
  });

  factory LoginData.fromJson(Map<String, dynamic> json) {
    return LoginData(
      tokens: TokenModel.fromJson(json['tokens']),
      user: UserModel.fromJson(json['user']),
    );
  }
}