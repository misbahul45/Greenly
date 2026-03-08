import 'package:app/features/auth/data/model/data/user_data.dart';
import 'package:app/shared/model/data/token_model.dart';

class LoginData {
  final TokenModel tokens;
  final UserData user;

  LoginData({required this.tokens, required this.user});

  factory LoginData.fromJson(Map<String, dynamic> json) {
    print(json);
    return LoginData(
      tokens: TokenModel.fromJson(json['tokens']),
      user: UserData.fromJson(json['user']),
    );
  }
}
