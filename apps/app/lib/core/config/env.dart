import 'package:flutter_dotenv/flutter_dotenv.dart';

class ENV {
  static String get api => dotenv.env['API_URL'] ?? '';
}
