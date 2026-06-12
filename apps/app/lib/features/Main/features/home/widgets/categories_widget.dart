import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/features/Main/features/home/bloc/home_bloc.dart';
import 'package:app/features/Main/features/home/bloc/home_event.dart';
import 'package:app/features/Main/features/home/bloc/home_state.dart';
import 'package:app/shared/widgets/category/category_grid.dart';
import 'package:app/shared/widgets/category/category_grid_skeleton.dart';
import 'package:app/shared/widgets/section_title_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class CategoriesWidget extends StatelessWidget {
  const CategoriesWidget({super.key});

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
          return Padding(
            padding: const EdgeInsets.all(UIConstants.paddingM),
            child: Row(
              children: [
                const Icon(Icons.error_outline_rounded, color: Colors.red),
                const SizedBox(width: UIConstants.spacingS),
                const Expanded(
                  child: Text(
                    'Terjadi kesalahan saat memuat kategori',
                    style: TextStyle(color: Colors.red),
                  ),
                ),
                TextButton(
                  onPressed: () =>
                      context.read<HomeBloc>().add(GetCategoriesRequested()),
                  child: const Text('Coba Lagi'),
                ),
              ],
            ),
          );
        }

        final items = categoryState.data.take(9).toList();

        if (items.isEmpty) {
          return const Padding(
            padding: EdgeInsets.all(UIConstants.paddingL),
            child: Center(child: Text('Tidak ada kategori tersedia')),
          );
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: UIConstants.spacingS),
            SectionTitleWidget(
              title: 'Kategori',
              onSeeAll: () =>
                  Navigator.pushNamed(context, AppRoutes.allCategories),
            ),
            const SizedBox(height: UIConstants.spacingS),
            CategoryGrid(
              categories: items,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(
                horizontal: UIConstants.paddingM,
              ),
              onTap: (category) => Navigator.pushNamed(
                context,
                AppRoutes.categoryProducts,
                arguments: {
                  'categoryId': category.id,
                  'categoryName': category.name,
                },
              ),
            ),
          ],
        );
      },
    );
  }
}

class CategoriesSkeleton extends StatelessWidget {
  const CategoriesSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(height: UIConstants.spacingS),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: UIConstants.paddingM),
          child: CategoryGridSkeleton(itemCount: 9, padding: EdgeInsets.zero),
        ),
      ],
    );
  }
}
