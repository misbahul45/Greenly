import 'package:app/features/auth/data/model/data/login_data.dart';

class LoginResponse {
  final LoginData data;

  LoginResponse({required this.data});

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    print('logins res ${json.toString()}');
    return LoginResponse(data: LoginData.fromJson(json));
  }
}
