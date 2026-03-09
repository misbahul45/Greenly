import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';
import 'package:app/shared/model/data/user_model.dart';
import 'package:app/core/config/env.dart';

class MeService {
  static String get _baseUrl => ENV.API;

  static Future<ApiResponse<UserModel>> getMe() async {
    return await ApiClient.get<UserModel>(
      "$_baseUrl/me",
      fromJsonT: (json) => UserModel.fromJson(json),
    );
  }
}
