import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/Main/features/home/domains/data/category_data.dart';
import 'package:app/features/Main/features/home/home_service.dart';
import 'package:app/features/categories/bloc/categories_bloc.dart';
import 'package:app/shared/widgets/cart_button_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class AllCategoriesScreen extends StatefulWidget {
  const AllCategoriesScreen({super.key});

  @override
  State<AllCategoriesScreen> createState() => _AllCategoriesScreenState();
}

class _AllCategoriesScreenState extends State<AllCategoriesScreen> {
  late final AllCategoriesBloc _bloc;
  late final ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _bloc = AllCategoriesBloc(HomeService())..add(AllCategoriesRequested());
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final pos = _scrollController.position;
    if (pos.pixels >= pos.maxScrollExtent - 300) {
      _bloc.add(AllCategoriesLoadMoreRequested());
    }
  }

  @override
  void dispose() {
    _bloc.close();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: _bloc,
      child: Scaffold(
        backgroundColor: const Color(0xFFF6FAF6),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
            onPressed: () => Navigator.pop(context),
          ),
          centerTitle: true,
          title: const Text(
            'Semua Kategori',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
          ),
          actions: const [
            CartButtonWidget(),
            SizedBox(width: UIConstants.spacingXS),
          ],
        ),
        body: BlocBuilder<AllCategoriesBloc, AllCategoriesState>(
          builder: (context, state) {
            if (state.isLoading) {
              return _CategoriesSkeletonGrid();
            }

            if (state.error != null && state.data.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.error_outline_rounded,
                      size: 48,
                      color: Colors.grey[300],
                    ),
                    const SizedBox(height: UIConstants.spacingM),
                    Text(
                      state.error!,
                      style: TextStyle(color: Colors.grey[600]),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: UIConstants.spacingM),
                    ElevatedButton(
                      onPressed: () => _bloc.add(AllCategoriesRequested()),
                      child: const Text('Coba Lagi'),
                    ),
                  ],
                ),
              );
            }

            if (state.data.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.category_outlined,
                      size: 64,
                      color: Colors.grey[300],
                    ),
                    const SizedBox(height: UIConstants.spacingM),
                    Text(
                      'Tidak ada kategori tersedia',
                      style: TextStyle(
                        color: Colors.grey[500],
                        fontSize: UIConstants.fontSizeL,
                      ),
                    ),
                  ],
                ),
              );
            }

            return RefreshIndicator(
              onRefresh: () async => _bloc.add(AllCategoriesRequested()),
              child: GridView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(UIConstants.paddingM),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: UIConstants.spacingM,
                  mainAxisSpacing: UIConstants.spacingM,
                  childAspectRatio: 1.1,
                ),
                itemCount: state.data.length + (state.isLoadingMore ? 3 : 0),
                itemBuilder: (context, i) {
                  if (i >= state.data.length) {
                    return _CategoryCardSkeleton();
                  }
                  return _CategoryCard(category: state.data[i]);
                },
              ),
            );
          },
        ),
      ),
    );
  }
}

class _CategoryCard extends StatelessWidget {
  final CategoryData category;

  const _CategoryCard({required this.category});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(
        context,
        AppRoutes.categoryProducts,
        arguments: {'category': category.slug},
      ),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(UIConstants.radiusM),
          boxShadow: [
            BoxShadow(
              color: AppTheme.primaryColor.withValues(alpha: 0.06),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.category_rounded,
                color: AppTheme.primaryColor,
                size: 22,
              ),
            ),
            const SizedBox(height: UIConstants.spacingS),
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: UIConstants.spacingXS,
              ),
              child: Text(
                category.name,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: UIConstants.fontSizeS,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                  height: 1.3,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryCardSkeleton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(UIConstants.radiusM),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: Colors.grey[200],
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(height: UIConstants.spacingS),
          Container(
            width: 60,
            height: 10,
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(height: 4),
          Container(
            width: 40,
            height: 10,
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoriesSkeletonGrid extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.all(UIConstants.paddingM),
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: UIConstants.spacingM,
        mainAxisSpacing: UIConstants.spacingM,
        childAspectRatio: 1.1,
      ),
      itemCount: 12,
      itemBuilder: (_, __) => _CategoryCardSkeleton(),
    );
  }
}
