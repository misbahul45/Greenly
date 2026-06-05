import 'package:app/core/constants/ui_constants.dart';
import 'package:app/features/Main/features/home/bloc/home_bloc.dart';
import 'package:app/features/Main/features/home/bloc/home_event.dart';
import 'package:app/features/Main/features/home/bloc/home_ml_bloc.dart';
import 'package:app/features/Main/features/home/bloc/home_ml_event.dart';
import 'package:app/features/Main/features/home/bloc/home_ml_state.dart';
import 'package:app/features/Main/features/home/widgets/banner_widget.dart';
import 'package:app/features/Main/features/home/widgets/categories_widget.dart';
import 'package:app/features/Main/features/home/widgets/home_search_entry_card.dart';
import 'package:app/features/Main/features/home/widgets/products_widget.dart';
import 'package:app/features/ml-products/widgets/ml_recommendation_section.dart';
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
    context.read<HomeMlBloc>().add(HomeMlStarted());

    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final position = _scrollController.position;
    if (position.pixels >= position.maxScrollExtent - 300) {
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
      child: RefreshIndicator(
        onRefresh: () async {
          context.read<HomeBloc>().add(GetActiveBannersRequested());
          context.read<HomeBloc>().add(GetCategoriesRequested());
          context.read<HomeBloc>().add(GetFeaturedProductsRequested());
          context.read<HomeMlBloc>().add(HomeMlRefreshed());
        },
        child: SingleChildScrollView(
          controller: _scrollController,
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(UIConstants.paddingS),
          child: Column(
            children: [
              const SizedBox(height: UIConstants.spacingS),
              const BannerWidget(),
              const SizedBox(height: UIConstants.spacingS),
              const CategoriesWidget(),
              const SizedBox(height: UIConstants.spacingS),
              BlocBuilder<HomeMlBloc, HomeMlState>(
                buildWhen: (p, c) => p.homeRecs != c.homeRecs,
                builder: (context, state) => MlRecommendationSection(
                  title: 'Rekomendasi Untuk Kamu',
                  products: state.homeRecs.data,
                  isLoading: state.homeRecs.isLoading,
                  error: state.homeRecs.error,
                  onRetry: () =>
                      context.read<HomeMlBloc>().add(HomeMlRefreshed()),
                ),
              ),
              const SizedBox(height: UIConstants.spacingXS),
              BlocBuilder<HomeMlBloc, HomeMlState>(
                buildWhen: (p, c) => p.ecoRecs != c.ecoRecs,
                builder: (context, state) => MlRecommendationSection(
                  title: 'Eco Picks',
                  products: state.ecoRecs.data,
                  isLoading: state.ecoRecs.isLoading,
                  error: state.ecoRecs.error,
                  onRetry: () =>
                      context.read<HomeMlBloc>().add(HomeMlRefreshed()),
                ),
              ),
              const SizedBox(height: UIConstants.spacingS),
              const ProductsWidget(),
            ],
          ),
        ),
      ),
    );
  }
}
