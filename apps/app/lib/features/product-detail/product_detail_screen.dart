import 'package:app/features/product-detail/bloc/product_detail_bloc.dart';
import 'package:app/features/product-detail/bloc/product_detail_event.dart';
import 'package:app/features/product-detail/bloc/product_detail_state.dart';
import 'package:app/features/product-detail/product_detail_service.dart';
import 'package:app/shared/widgets/cart_button_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProductDetailScreen extends StatelessWidget {
  final String slug;

  const ProductDetailScreen({
    super.key,
    required this.slug,
  });

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => ProductDetailBloc(
        productDetailService: context.read<ProductDetailService>(),
      )..add(GetDetailProduct(slug: slug)),
      child: Scaffold(
        appBar: AppBar(
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () {
              Navigator.pop(context);
            },
          ),
          centerTitle: true,
          title: const Text(
            "Detail Product",
            style: TextStyle(
              fontWeight: FontWeight.w600,
            ),
          ),
          actions: [
            CartButtonWidget(),
          ],
        ),
        body: BlocBuilder<ProductDetailBloc, ProductDetailState>(
          builder: (context, state) {
            if (state.product.isLoading) {
              return const Center(
                child: CircularProgressIndicator(),
              );
            }

            if (state.error != null) {
              return Center(
                child: Text(state.error!),
              );
            }

            final product = state.product.data;

            if (product == null) {
              return const Center(
                child: Text("No data"),
              );
            }

            return AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: Center(
                child: Text(
                  product.name,
                  key: ValueKey(product.id),
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}