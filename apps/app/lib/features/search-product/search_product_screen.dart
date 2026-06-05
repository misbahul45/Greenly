import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/Main/features/home/bloc/home_bloc.dart';
import 'package:app/features/search-product/bloc/search_product_bloc.dart';
import 'package:app/features/search-product/domain/data/search_product_result.dart';
import 'package:app/features/search-product/domain/dto/search_product_filter.dart';
import 'package:app/features/search-product/service/search_product_service.dart';
import 'package:app/features/search-product/widgets/search_bar_widget.dart';
import 'package:app/features/search-product/widgets/search_filter_sheet.dart';
import 'package:app/features/search-product/widgets/search_history_widget.dart';
import 'package:app/features/search-product/widgets/search_result_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class SearchProductScreen extends StatelessWidget {
  const SearchProductScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          SearchProductBloc(SearchProductService())
            ..add(const SearchProductStarted()),
      child: const _SearchView(),
    );
  }
}

class _SearchView extends StatefulWidget {
  const _SearchView();

  @override
  State<_SearchView> createState() => _SearchViewState();
}

class _SearchViewState extends State<_SearchView> {
  final TextEditingController _ctrl = TextEditingController();

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _submit(String query) {
    final filter = context.read<SearchProductBloc>().state.filter;
    context.read<SearchProductBloc>().add(
      SearchProductSubmitted(query: query, filter: filter),
    );
  }

  Future<void> _openFilter() async {
    final bloc = context.read<SearchProductBloc>();
    final homeState = context.read<HomeBloc>().state;
    final result = await showModalBottomSheet<SearchProductFilter>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(UIConstants.radiusL),
        ),
      ),
      builder: (_) => SearchFilterSheet(
        current: bloc.state.filter,
        categories: homeState.category.data,
      ),
    );
    if (result != null && mounted) {
      final query = bloc.state.lastQuery;
      if (query.isNotEmpty) {
        bloc.add(SearchProductSubmitted(query: query, filter: result));
      } else {
        bloc.add(SearchProductFilterUpdated(result));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Cari Produk')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
              UIConstants.paddingM,
              UIConstants.paddingS,
              UIConstants.paddingM,
              UIConstants.paddingS,
            ),
            child: Row(
              children: [
                Expanded(
                  child: SearchBarWidget(
                    controller: _ctrl,
                    onSubmitted: _submit,
                  ),
                ),
                const SizedBox(width: UIConstants.spacingS),
                _FilterButton(onTap: _openFilter),
              ],
            ),
          ),
          BlocBuilder<SearchProductBloc, SearchProductState>(
            buildWhen: (p, c) => p.filter != c.filter,
            builder: (context, state) {
              if (state.filter.isEmpty) return const SizedBox.shrink();

              String? categoryName;
              if (state.filter.categoryId != null) {
                final cats = context.read<HomeBloc>().state.category.data;
                final matches = cats
                    .where((c) => c.id == state.filter.categoryId)
                    .toList();
                categoryName = matches.isNotEmpty
                    ? matches.first.name
                    : state.filter.categoryId;
              }

              return _ActiveFilterChips(
                filter: state.filter,
                categoryName: categoryName,
                onRemovePrice: () => context.read<SearchProductBloc>().add(
                  SearchProductFilterUpdated(
                    SearchProductFilter(
                      categoryId: state.filter.categoryId,
                      minEcoScore: state.filter.minEcoScore,
                    ),
                  ),
                ),
                onRemoveEco: () => context.read<SearchProductBloc>().add(
                  SearchProductFilterUpdated(
                    SearchProductFilter(
                      categoryId: state.filter.categoryId,
                      minPrice: state.filter.minPrice,
                      maxPrice: state.filter.maxPrice,
                    ),
                  ),
                ),
                onRemoveCategory: () => context.read<SearchProductBloc>().add(
                  SearchProductFilterUpdated(
                    SearchProductFilter(
                      minPrice: state.filter.minPrice,
                      maxPrice: state.filter.maxPrice,
                      minEcoScore: state.filter.minEcoScore,
                    ),
                  ),
                ),
              );
            },
          ),
          Expanded(
            child: BlocBuilder<SearchProductBloc, SearchProductState>(
              builder: (context, state) => switch (state.status) {
                SearchStatus.loading => const Center(
                  child: CircularProgressIndicator(),
                ),
                SearchStatus.error => _ErrorView(
                  message: state.error ?? 'Terjadi kesalahan',
                  onRetry: () => context.read<SearchProductBloc>().add(
                    const SearchProductRetryRequested(),
                  ),
                ),
                SearchStatus.loaded =>
                  state.results.isEmpty
                      ? _EmptyView(query: state.lastQuery)
                      : _ResultList(
                          results: state.results,
                          fromFallback: state.fromFallback,
                        ),
                SearchStatus.initial => SearchHistoryWidget(
                  history: state.history,
                  onTap: (q) {
                    _ctrl.text = q;
                    _submit(q);
                  },
                  onRemove: (q) => context.read<SearchProductBloc>().add(
                    SearchProductHistoryItemRemoved(q),
                  ),
                  onClearAll: () => context.read<SearchProductBloc>().add(
                    const SearchProductHistoryClearRequested(),
                  ),
                ),
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterButton extends StatelessWidget {
  final VoidCallback onTap;

  const _FilterButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SearchProductBloc, SearchProductState>(
      buildWhen: (p, c) => p.filter.isEmpty != c.filter.isEmpty,
      builder: (_, state) {
        final active = !state.filter.isEmpty;
        return IconButton(
          onPressed: onTap,
          icon: Icon(
            Icons.tune,
            color: active ? AppTheme.primaryColor : Colors.grey,
          ),
          style: IconButton.styleFrom(
            backgroundColor: active
                ? AppTheme.primaryColor.withValues(alpha: 0.1)
                : Colors.transparent,
          ),
        );
      },
    );
  }
}

class _ActiveFilterChips extends StatelessWidget {
  final SearchProductFilter filter;
  final String? categoryName;
  final VoidCallback onRemovePrice;
  final VoidCallback onRemoveEco;
  final VoidCallback onRemoveCategory;

  const _ActiveFilterChips({
    required this.filter,
    required this.onRemovePrice,
    required this.onRemoveEco,
    required this.onRemoveCategory,
    this.categoryName,
  });

  @override
  Widget build(BuildContext context) {
    final hasPrice = filter.minPrice != null || filter.maxPrice != null;
    final hasEco = filter.minEcoScore != null;
    final hasCategory = filter.categoryId != null;

    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: UIConstants.paddingM,
        vertical: UIConstants.spacingXS,
      ),
      child: Wrap(
        spacing: UIConstants.spacingS,
        children: [
          if (hasCategory)
            _Chip(
              label: categoryName ?? filter.categoryId!,
              onDelete: onRemoveCategory,
            ),
          if (hasPrice)
            _Chip(label: _priceLabel(filter), onDelete: onRemovePrice),
          if (hasEco)
            _Chip(
              label: 'Eco ≥ ${filter.minEcoScore!.toInt()}',
              onDelete: onRemoveEco,
            ),
        ],
      ),
    );
  }

  String _priceLabel(SearchProductFilter f) {
    if (f.minPrice != null && f.maxPrice != null) {
      return 'Rp ${f.minPrice!.toInt()}–${f.maxPrice!.toInt()}';
    } else if (f.minPrice != null) {
      return '≥ Rp ${f.minPrice!.toInt()}';
    } else {
      return '≤ Rp ${f.maxPrice!.toInt()}';
    }
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final VoidCallback onDelete;

  const _Chip({required this.label, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(
        label,
        style: const TextStyle(fontSize: UIConstants.fontSizeXS),
      ),
      deleteIcon: const Icon(Icons.close, size: 14),
      onDeleted: onDelete,
      backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.08),
      side: BorderSide.none,
      padding: EdgeInsets.zero,
      labelPadding: const EdgeInsets.symmetric(horizontal: 6),
    );
  }
}

class _ResultList extends StatelessWidget {
  final List<SearchProductResult> results;
  final bool fromFallback;

  const _ResultList({required this.results, required this.fromFallback});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(UIConstants.paddingM),
      itemCount: results.length,
      separatorBuilder: (_, _) => const SizedBox(height: UIConstants.spacingM),
      itemBuilder: (_, index) {
        final item = results[index];
        return SearchResultCard(
          result: item,
          onTap: item.slug != null && item.slug!.isNotEmpty
              ? () => Navigator.pushNamed(
                  context,
                  AppRoutes.productDetail,
                  arguments: item.slug,
                )
              : null,
        );
      },
    );
  }
}

class _EmptyView extends StatelessWidget {
  final String query;

  const _EmptyView({required this.query});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(UIConstants.paddingL),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.search_off_rounded,
              size: 64,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: UIConstants.spacingL),
            Text(
              'Tidak ada produk untuk "$query"',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: UIConstants.fontSizeL,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: UIConstants.spacingS),
            Text(
              'Coba kata kunci lain atau hapus filter',
              style: TextStyle(
                fontSize: UIConstants.fontSizeS,
                color: Colors.grey.shade500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(UIConstants.paddingL),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.wifi_off_rounded, size: 64, color: Colors.grey.shade400),
            const SizedBox(height: UIConstants.spacingL),
            const Text(
              'Gagal memuat hasil pencarian',
              style: TextStyle(
                fontSize: UIConstants.fontSizeL,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: UIConstants.spacingXS),
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: UIConstants.fontSizeS,
                color: Colors.grey.shade500,
              ),
            ),
            const SizedBox(height: UIConstants.spacingXXL),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Coba Lagi'),
            ),
          ],
        ),
      ),
    );
  }
}
