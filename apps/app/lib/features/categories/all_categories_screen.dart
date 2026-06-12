import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/features/Main/features/home/home_service.dart';
import 'package:app/features/categories/bloc/categories_bloc.dart';
import 'package:app/shared/widgets/cart_button_widget.dart';
import 'package:app/shared/widgets/category/category_grid.dart';
import 'package:app/shared/widgets/category/category_grid_skeleton.dart';
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
              return const CategoryGridSkeleton(
                itemCount: 12,
                shrinkWrap: false,
                physics: AlwaysScrollableScrollPhysics(),
              );
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
              child: CategoryGrid(
                categories: state.data,
                controller: _scrollController,
                itemCountOverride:
                    state.data.length + (state.isLoadingMore ? 3 : 0),
                loadingItemBuilder: (_, _) => const CategoryCardSkeleton(),
                onTap: (category) => Navigator.pushNamed(
                  context,
                  AppRoutes.categoryProducts,
                  arguments: {
                    'categoryId': category.id,
                    'categoryName': category.name,
                  },
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
