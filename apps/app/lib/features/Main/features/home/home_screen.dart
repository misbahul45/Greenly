import 'package:app/features/Main/features/home/bloc/home_bloc.dart';
import 'package:app/features/Main/features/home/bloc/home_event.dart';
import 'package:app/features/Main/features/home/widgets/banner_widget.dart';
import 'package:app/features/Main/features/home/widgets/categories_widget.dart';
import 'package:app/features/Main/features/home/widgets/product_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    print('HomeScreen initState called');
    context.read<HomeBloc>().add(GetActiveBannersRequested());
    context.read<HomeBloc>().add(GetCategoriesRequested());
    context.read<HomeBloc>().add(GetFeaturedProductsRequested());
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(10),
        child: Column(
          children: const [
            BannerWidget(),
            SizedBox(height: 20),
            CategoriesWidget(),
            SizedBox(height: 20),
            ProductWidget(),
          ],
        ),
      ),
    );
  }
}