import 'package:app/features/auth/domains/data/user_login_data.dart';
import 'package:app/shared/domains/data/token_model.dart';

class LoginData {
  final TokenModel tokens;
  final UserLoginData user;

  LoginData({required this.tokens, required this.user});

  factory LoginData.fromJson(Map<String, dynamic> json) {
    return LoginData(
      tokens: TokenModel.fromJson(json['tokens']),
      user: UserLoginData.fromJson(json['user']),
    );
  }
}
