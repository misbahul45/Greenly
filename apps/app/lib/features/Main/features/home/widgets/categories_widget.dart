import 'package:app/core/router/app_routes.dart';
import 'package:app/features/Main/features/home/bloc/home_bloc.dart';
import 'package:app/features/Main/features/home/bloc/home_event.dart';
import 'package:app/features/Main/features/home/bloc/home_state.dart';
import 'package:app/features/Main/features/home/widgets/category_widget.dart';
import 'package:app/features/Main/features/home/widgets/skeleton/categories_skeleton.dart';
import 'package:app/shared/widgets/section_title.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class CategoriesWidget extends StatefulWidget {
  const CategoriesWidget({super.key});

  @override
  State<CategoriesWidget> createState() => _CategoriesWidgetState();
}

class _CategoriesWidgetState extends State<CategoriesWidget> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;

    final position = _scrollController.position;
    const threshold = 150.0;

    if (position.pixels >= position.maxScrollExtent - threshold) {
      context.read<HomeBloc>().add(GetLoadMoreCategoriesRequested());
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<HomeBloc, HomeState>(
      buildWhen: (previous, current) => previous.category != current.category,
      builder: (context, state) {
        final categoryState = state.category;

        if (categoryState.isLoading) {
          return const CategoriesSkeleton();
        }

        if (state.error != null) {
          return const Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              'Terjadi kesalahan saat memuat kategori',
              style: TextStyle(color: Colors.red),
            ),
          );
        }

        final items = categoryState.data;

        if (items.isEmpty) {
          return const Padding(
            padding: EdgeInsets.all(16),
            child: Text('Tidak ada kategori tersedia'),
          );
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 10),
            SectionTitle(
              title: "Categories",
              onSeeAll: () {
                Navigator.pushNamed(context, AppRoutes.categoryProducts);
              },
            ),
            const SizedBox(height: 10),
            SizedBox(
              height: 30,
              child: ListView.separated(
                controller: _scrollController,
                scrollDirection: Axis.horizontal,
                itemCount: categoryState.isLoadingMore
                    ? items.length + 1
                    : items.length,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  if (index >= items.length) {
                    return Center(
                      child: SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Theme.of(context).primaryColor,
                        ),
                      ),
                    );
                  }

                  final item = items[index];
                  return CategoryWidget(
                    title: item.name,
                    slug: item.slug,
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }
}