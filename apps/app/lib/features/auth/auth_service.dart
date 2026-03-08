import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';
import 'package:app/features/auth/data/model/dto/login_dto.dart';
import 'package:app/features/auth/data/model/dto/register_dto.dart';
import 'package:app/features/auth/data/model/dto/verify_email_dto.dart';
import 'package:app/features/auth/data/model/response/login_response.dart';
import 'package:app/features/auth/data/model/response/register_response.dart';
import 'package:app/features/auth/data/model/response/verify_email_response.dart';
import 'package:app/shared/model/data/token_model.dart';

class AuthService {
  static String get _baseUrl => ENV.API;

  static Future<ApiResponse<RegisterResponse>> register(RegisterDto payload) async {
    return await ApiClient.post<RegisterResponse>(
      "$_baseUrl/auth/register",
      payload.toJson(),
      fromJsonT: (json) => RegisterResponse.fromJson(json),
    );
  }


   Future<ApiResponse<LoginResponse>> login(LoginDto payload) async {
    return await ApiClient.post<LoginResponse>(
      "$_baseUrl/auth/login",
      payload.toJson(),
      fromJsonT: (json) => LoginResponse.fromJson(json),
    );
  }


  Future<ApiResponse<VerifyEmailResponse>> verifyEmail(VerifyEmailDto payload) async {
    return await ApiClient.post<VerifyEmailResponse>(
      "$_baseUrl/auth/verify-email",
      payload.toJson(),
      fromJsonT: (json) => VerifyEmailResponse.fromJson(json),
    );
  }

  Future<ApiResponse<dynamic>> resendOtp(String email, String tokenFor) async {
    return await ApiClient.post<dynamic>(
      "$_baseUrl/auth/resend-token?for=$tokenFor",
      {
        "email": email,
      },
    );
  }
  
  static Future<ApiResponse<dynamic>> forgotPassword(String email) async {
    return await ApiClient.post<dynamic>(
      "$_baseUrl/auth/forgot-password",
      {
        "email": email,
      },
    );
  }
  
  static Future<ApiResponse<TokenModel>> refreshToken() async{
    return await ApiClient.post<TokenModel>(
      "$_baseUrl/auth/refresh",
      {},
    );
  }
}