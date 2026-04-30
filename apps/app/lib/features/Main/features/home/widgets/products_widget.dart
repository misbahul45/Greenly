import 'package:app/core/router/app_routes.dart';
import 'package:app/features/Main/features/home/bloc/home_bloc.dart';
import 'package:app/features/Main/features/home/bloc/home_state.dart';
import 'package:app/features/Main/features/home/widgets/product_grid.dart';
import 'package:app/shared/widgets/section_title.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProductsWidget extends StatelessWidget {
  const ProductsWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<HomeBloc, HomeState>(
      buildWhen: (p, c) => p.product != c.product,
      builder: (context, state) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SectionTitle(
              title: "Products",
              onSeeAll: () {
                Navigator.pushNamed(context, AppRoutes.products);
              },
            ),
            const SizedBox(height: 12),
            ProductGrid(state: state.product),
          ],
        );
      },
    );
  }
}