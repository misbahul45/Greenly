import 'package:app/core/router/auth_routes.dart';
import 'package:app/core/router/router_generate.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/auth/auth_service.dart';
import 'package:app/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:app/features/auth/presentation/bloc/auth_event.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return RepositoryProvider<AuthService>(
      create: (_) => AuthService(),
      child: BlocProvider<AuthBloc>(
        create: (context) =>
            AuthBloc(context.read<AuthService>())
              ..add(AuthCheckRequested()),
        child: MaterialApp(
          title: 'Greenly Mart',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          initialRoute: AuthRoutes.login,
          onGenerateRoute: RouterGenerate.generateRoute,
        ),
      ),
    );
  }
}