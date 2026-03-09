import 'package:app/features/auth/data/model/data/login_data.dart';

class VerifyEmailResponse {
  final LoginData data;
  
  VerifyEmailResponse(
    {required this.data}
  );

  factory VerifyEmailResponse.fromJson(Map<String, dynamic> json) {
    return VerifyEmailResponse(
      data:LoginData.fromJson(json)
    );
  }
}
