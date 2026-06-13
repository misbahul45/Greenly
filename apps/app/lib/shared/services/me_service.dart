import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';
import 'package:app/features/Main/features/profile/domain/data/profile_detail_data.dart';
import 'package:app/shared/domains/data/user_model.dart';
import 'package:app/shared/domains/dto/update_profile_dto.dart';
import 'package:app/core/config/env.dart';

class MeService {
  static String get _baseUrl => ENV.coreApiUrl;

  static Future<ApiResponse<UserModel>> getMe() async {
    return await ApiClient.get<UserModel>(
      "$_baseUrl/me",
      fromJsonT: (json) => UserModel.fromJson(json),
    );
  }

  static Future<ApiResponse<ProfileDetailData>> getProfileDetail() async {
    return await ApiClient.get<ProfileDetailData>(
      "$_baseUrl/me",
      fromJsonT: (json) => ProfileDetailData.fromJson(json),
    );
  }

  static Future<ApiResponse<dynamic>> updateProfile(
    UpdateProfileDto payload,
  ) async {
    return await ApiClient.patch<dynamic>(
      "$_baseUrl/me/update",
      payload.toJson(),
    );
  }
}
