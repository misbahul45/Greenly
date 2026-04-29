import 'package:app/core/router/auth_routes.dart';
import 'package:app/core/router/router_generate.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/auth/auth_service.dart';
import 'package:app/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:app/features/Main/features/home/bloc/home_bloc.dart'; // tambah
import 'package:app/features/Main/features/home/home_service.dart';   // tambah
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<AuthService>(create: (_) => AuthService()),
        RepositoryProvider<HomeService>(create: (_) => HomeService()), 
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider<AuthBloc>(
            create: (context) => AuthBloc(context.read<AuthService>()),
          ),
          BlocProvider<HomeBloc>(
            create: (context) => HomeBloc(context.read<HomeService>()), 
          ),
        ],
        child: MaterialApp(
          title: 'Greenly Mart',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          initialRoute: AuthRoutes.splash,
          onGenerateRoute: RouterGenerate.generateRoute,
        ),
      ),
    );
  }
}