import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:Greenly/core/theme/app_theme.dart';
import 'package:Greenly/core/utils/currency_helper.dart';
import 'package:Greenly/features/Main/features/home/bloc/home_bloc.dart';
import 'package:Greenly/features/Main/features/home/bloc/home_event.dart';
import 'package:Greenly/features/Main/features/home/bloc/home_ml_bloc.dart';
import 'package:Greenly/features/Main/features/home/bloc/home_ml_event.dart';
import 'package:Greenly/features/Main/features/home/bloc/home_ml_state.dart';
import 'package:Greenly/features/Main/features/home/bloc/home_state.dart';
import 'package:Greenly/features/Main/features/home/domains/data/product_data.dart';
import 'package:Greenly/features/Main/features/home/widgets/banner_widget.dart';
import 'package:Greenly/features/Main/features/home/widgets/categories_widget.dart';
import 'package:Greenly/features/Main/features/home/widgets/products_widget.dart';
import 'package:Greenly/features/ml-products/widgets/ml_recommendation_section.dart';
import 'package:Greenly/shared/widgets/charts/rating_distribution_chart.dart';
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

  Future<void> _onRefresh() async {
    context.read<HomeBloc>().add(GetActiveBannersRequested());
    context.read<HomeBloc>().add(GetCategoriesRequested());
    context.read<HomeBloc>().add(GetFeaturedProductsRequested());
    context.read<HomeMlBloc>().add(HomeMlRefreshed());
  }

  @override
  void dispose() {
    _scrollController
      ..removeListener(_onScroll)
      ..dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _onRefresh,
        child: SingleChildScrollView(
          controller: _scrollController,
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(UIConstants.paddingS),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: UIConstants.spacingS),
              const BannerWidget(),
              const SizedBox(height: UIConstants.spacingS),
              const _HomeInsightSection(),
              const SizedBox(height: UIConstants.spacingS),
              const CategoriesWidget(),
              const SizedBox(height: UIConstants.spacingS),
              BlocBuilder<HomeMlBloc, HomeMlState>(
                buildWhen: (previous, current) =>
                    previous.homeRecs != current.homeRecs,
                builder: (context, state) {
                  return MlRecommendationSection(
                    title: 'Rekomendasi Untuk Kamu',
                    products: state.homeRecs.data,
                    isLoading: state.homeRecs.isLoading,
                    error: state.homeRecs.error,
                    onRetry: () {
                      context.read<HomeMlBloc>().add(HomeMlRefreshed());
                    },
                  );
                },
              ),
              const SizedBox(height: UIConstants.spacingXS),
              BlocBuilder<HomeMlBloc, HomeMlState>(
                buildWhen: (previous, current) =>
                    previous.ecoRecs != current.ecoRecs,
                builder: (context, state) {
                  return MlRecommendationSection(
                    title: 'Eco Picks',
                    products: state.ecoRecs.data,
                    isLoading: state.ecoRecs.isLoading,
                    error: state.ecoRecs.error,
                    onRetry: () {
                      context.read<HomeMlBloc>().add(HomeMlRefreshed());
                    },
                  );
                },
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

class _HomeInsightSection extends StatelessWidget {
  const _HomeInsightSection();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<HomeBloc, HomeState>(
      buildWhen: (previous, current) => previous.product != current.product,
      builder: (context, homeState) {
        return BlocBuilder<HomeMlBloc, HomeMlState>(
          buildWhen: (previous, current) =>
              previous.ecoRecs != current.ecoRecs ||
              previous.homeRecs != current.homeRecs,
          builder: (context, mlState) {
            final products = homeState.product.data;
            final mlProducts = [
              ...mlState.homeRecs.data,
              ...mlState.ecoRecs.data,
            ];

            if (products.isEmpty && mlProducts.isEmpty) {
              return const SizedBox.shrink();
            }

            final avgPrice = products.isEmpty
                ? 0
                : products.fold<int>(0, (sum, product) {
                      return sum + product.price;
                    }) ~/
                    products.length;

            final ecoScores = mlProducts
                .map((product) => product.ecoScore)
                .whereType<double>()
                .toList();

            final avgEco = ecoScores.isEmpty
                ? null
                : ecoScores.reduce((a, b) => a + b) / ecoScores.length;

            final ratingCounts = _ratingDistribution(products);
            final hasRatings = ratingCounts.any((value) => value > 0);

            return Container(
              width: double.infinity,
              clipBehavior: Clip.antiAlias,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(UIConstants.radiusL),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.06),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(),
                  Padding(
                    padding: const EdgeInsets.all(UIConstants.paddingM),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _ResponsiveStatsGrid(
                          children: [
                            _buildStat(
                              '${products.length}',
                              'Produk tampil',
                              Icons.inventory_2_outlined,
                              const Color(0xFF1565C0),
                            ),
                            _buildStat(
                              avgPrice > 0
                                  ? CurrencyHelper.formatRupiah(avgPrice)
                                  : '-',
                              'Rata-rata harga',
                              Icons.payments_outlined,
                              const Color(0xFF6A1B9A),
                            ),
                            _buildStat(
                              '${mlState.ecoRecs.data.length}',
                              'Eco picks',
                              Icons.eco_outlined,
                              AppTheme.primaryColor,
                            ),
                            _buildStat(
                              avgEco != null
                                  ? avgEco.toStringAsFixed(1)
                                  : '-',
                              'Avg eco score',
                              Icons.energy_savings_leaf_outlined,
                              const Color(0xFFE65100),
                            ),
                          ],
                        ),
                        if (hasRatings) ...[
                          const SizedBox(height: UIConstants.spacingL),
                          Row(
                            children: [
                              Icon(
                                Icons.star_outline_rounded,
                                size: 15,
                                color: Colors.grey[600],
                              ),
                              const SizedBox(width: 5),
                              Text(
                                'Distribusi Rating Produk',
                                style: TextStyle(
                                  fontSize: UIConstants.fontSizeS,
                                  color: Colors.grey[700],
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: UIConstants.spacingS),
                          RatingDistributionChart(counts: ratingCounts),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: UIConstants.paddingM,
        vertical: UIConstants.spacingM,
      ),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primaryColor, Color(0xFF388E3C)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(UIConstants.radiusS),
            ),
            child: const Icon(
              Icons.insights_outlined,
              color: Colors.white,
              size: 18,
            ),
          ),
          const SizedBox(width: UIConstants.spacingM),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Greenly Insight',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: UIConstants.fontSizeL,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                Text(
                  'Statistik produk terkini',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: UIConstants.fontSizeXS,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStat(String value, String label, IconData icon, Color color) {
    return Container(
      constraints: const BoxConstraints(minHeight: 92),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(UIConstants.radiusM),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(height: UIConstants.spacingS),
          Flexible(
            child: Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: UIConstants.fontSizeM,
                fontWeight: FontWeight.w800,
                color: Colors.black87,
              ),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: UIConstants.fontSizeXS,
              color: Colors.grey[500],
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  List<double> _ratingDistribution(List<ProductData> products) {
    final counts = List<double>.filled(5, 0);

    for (final product in products) {
      if (product.ratingAverage <= 0) continue;

      final index = product.ratingAverage.round().clamp(1, 5) - 1;
      counts[index] += 1;
    }

    return counts;
  }
}

class _ResponsiveStatsGrid extends StatelessWidget {
  const _ResponsiveStatsGrid({
    required this.children,
  });

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;

        final crossAxisCount = width >= 720
            ? 4
            : width >= 320
                ? 2
                : 1;

        final childAspectRatio = crossAxisCount == 1
            ? 3.2
            : crossAxisCount == 2
                ? 1.55
                : 1.35;

        return GridView.count(
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: UIConstants.spacingS,
          mainAxisSpacing: UIConstants.spacingS,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          childAspectRatio: childAspectRatio,
          children: children,
        );
      },
    );
  }
}