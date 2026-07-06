import 'package:Greenly/core/router/auth_routes.dart';
import 'package:Greenly/core/router/router_generate.dart';
import 'package:Greenly/core/theme/app_theme.dart';
import 'package:Greenly/features/auth/auth_service.dart';
import 'package:Greenly/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:Greenly/features/Main/features/home/bloc/home_bloc.dart';
import 'package:Greenly/features/Main/features/home/bloc/home_ml_bloc.dart';
import 'package:Greenly/features/Main/features/home/home_service.dart';
import 'package:Greenly/features/ml-products/service/ml_product_service.dart';
import 'package:Greenly/features/product-detail/product_detail_service.dart';
import 'package:Greenly/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:Greenly/features/cart/service/cart_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:intl/date_symbol_data_local.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await _loadEnv();
  await initializeDateFormatting('id_ID', null);
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  runApp(const MyApp());
}

Future<void> _loadEnv() async {
  try {
    await dotenv.load(fileName: '.env');
  } catch (_) {
    await dotenv.load(fileName: '.env.example');
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<AuthService>(create: (_) => AuthService()),
        RepositoryProvider<HomeService>(create: (_) => HomeService()),
        RepositoryProvider<ProductDetailService>(
          create: (_) => ProductDetailService(),
        ),
        RepositoryProvider<CartService>(create: (_) => CartService()),
        RepositoryProvider<MlProductService>(create: (_) => MlProductService()),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider<AuthBloc>(
            create: (context) => AuthBloc(context.read<AuthService>()),
          ),
          BlocProvider<HomeBloc>(
            create: (context) => HomeBloc(context.read<HomeService>()),
          ),
          BlocProvider<HomeMlBloc>(
            create: (context) => HomeMlBloc(context.read<MlProductService>()),
          ),
          BlocProvider<CartBloc>(
            create: (context) =>
                CartBloc(context.read<CartService>())..add(CartLoadRequested()),
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
