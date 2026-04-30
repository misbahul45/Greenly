import 'package:app/features/Main/features/home/bloc/home_bloc.dart';
import 'package:app/features/Main/features/home/bloc/home_event.dart';
import 'package:app/features/Main/features/home/widgets/banner_widget.dart';
import 'package:app/features/Main/features/home/widgets/categories_widget.dart';
import 'package:app/features/Main/features/home/widgets/products_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    context.read<HomeBloc>().add(GetActiveBannersRequested());
    context.read<HomeBloc>().add(GetCategoriesRequested());
    context.read<HomeBloc>().add(GetFeaturedProductsRequested());

    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;

    final position = _scrollController.position;
    const threshold = 300.0;

    if (position.pixels >= position.maxScrollExtent - threshold) {
      context.read<HomeBloc>().add(LoadMoreProductsRequested());
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        // ✅ ScrollController dipasang di sini (parent scroll)
        controller: _scrollController,
        padding: const EdgeInsets.all(10),
        child: Column(
          children: const [
            BannerWidget(),
            SizedBox(height: 20),
            CategoriesWidget(),
            SizedBox(height: 20),
            ProductsWidget(),
          ],
        ),
      ),
    );
  }
}