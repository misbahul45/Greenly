import 'package:app/features/auth/presentation/screens/register_screen.dart';
import 'package:app/features/auth/presentation/screens/verify_email_screen.dart';
import 'package:flutter/material.dart';

/// AUTH SCREENS
import 'package:app/features/auth/presentation/screens/login_screen.dart';
// import 'package:app/features/auth/presentation/screens/register_screen.dart';
// import 'package:app/features/auth/presentation/screens/forgot_password_screen.dart';
// import 'package:app/features/auth/presentation/screens/verify_email_screen.dart';

// /// APP SCREENS

import 'auth_routes.dart';

class RouterGenerate {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {

      case AuthRoutes.login:
        return _page(const LoginScreen());

       case AuthRoutes.register:
         return _page(const RegisterScreen());

      // case AuthRoutes.forgotPassword:
      //   return _page(const ForgotPasswordScreen());

      case AuthRoutes.verifyEmail:
        return _page(const VerifyEmailScreen());

      // case AppRoutes.home:
      //   return _page(const HomeScreen());

      // case AppRoutes.profile:
      //   return _page(const ProfileScreen());

      default:
        return _page(
          const Scaffold(
            body: Center(child: Text("Page Not Found")),
          ),
        );
    }
  }

  static MaterialPageRoute _page(Widget child) {
    return MaterialPageRoute(builder: (_) => child);
  }
}