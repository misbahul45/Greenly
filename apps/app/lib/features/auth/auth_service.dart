import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';
import 'package:app/features/auth/data/model/dto/login_dto.dart';
import 'package:app/features/auth/data/model/dto/register_dto.dart';
import 'package:app/features/auth/data/model/dto/verify_email_dto.dart';
import 'package:app/features/auth/data/model/response/login_response.dart';
import 'package:app/features/auth/data/model/response/register_response.dart';
import 'package:app/features/auth/data/model/response/verify_email_response.dart';

class AuthService {
  static String get _baseUrl => ENV.API;

  static Future<ApiResponse<RegisterResponse>> register(RegisterDto payload) async {
    return await ApiClient.post<RegisterResponse>(
      "$_baseUrl/auth/register",
      payload.toJson(),
      fromJsonT: (json) => RegisterResponse.fromJson(json),
    );
  }


  static Future<ApiResponse<LoginResponse>> login(LoginDto payload) async {
    return await ApiClient.post<LoginResponse>(
      "$_baseUrl/auth/login",
      payload.toJson(),
      fromJsonT: (json) => LoginResponse.fromJson(json),
    );
  }


  static Future<ApiResponse<VerifyEmailResponse>> verifyEmail(VerifyEmailDto payload) async {
    return await ApiClient.post<VerifyEmailResponse>(
      "$_baseUrl/auth/verify-email",
      payload.toJson(),
      fromJsonT: (json) => VerifyEmailResponse.fromJson(json),
    );
  }
}