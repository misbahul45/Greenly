import 'package:flutter_dotenv/flutter_dotenv.dart';

class ENV {
  static String get api {
    const dartDefineApi = String.fromEnvironment('API_URL');
    if (dartDefineApi.isNotEmpty) return dartDefineApi;
    return dotenv.env['API_URL'] ?? '';
  }
}
