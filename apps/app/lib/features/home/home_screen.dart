import 'package:app/core/constants/dummy_data.dart';
import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/models/product_model.dart';
import 'package:app/features/home/widgets/category_section.dart';
import 'package:app/features/home/widgets/home_app_bar.dart';
import 'package:app/features/home/widgets/home_banner.dart';
import 'package:app/features/home/widgets/home_bottom_nav.dart';
import 'package:app/features/home/widgets/home_search_bar.dart';
import 'package:app/features/home/widgets/product_grid.dart';
import 'package:app/features/home/widgets/product_section_header.dart';
import 'package:flutter/material.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedNavIndex = 0;
  String _selectedCategoryId = 'cat-1';
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  List<ProductModel> get _filteredProducts {
    return dummyProducts.where((p) {
      final matchesCategory =
          _selectedCategoryId == 'cat-1' || p.categoryId == _selectedCategoryId;
      final matchesSearch =
          _searchQuery.isEmpty ||
          p.name.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && p.isActive;
    }).toList();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final products = _filteredProducts;

    return Scaffold(
      backgroundColor: const Color(0xFFF6FAF6),
      appBar: const HomeAppBar(),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(
            child: HomeSearchBar(
              controller: _searchController,
              searchQuery: _searchQuery,
              onChanged: (v) => setState(() => _searchQuery = v),
              onClear: () {
                _searchController.clear();
                setState(() => _searchQuery = '');
              },
            ),
          ),
          const SliverToBoxAdapter(child: HomeBanner()),
          SliverToBoxAdapter(
            child: CategorySection(
              categories: dummyCategories,
              selectedCategoryId: _selectedCategoryId,
              onCategorySelected: (id) =>
                  setState(() => _selectedCategoryId = id),
            ),
          ),
          SliverToBoxAdapter(
            child: ProductSectionHeader(productCount: products.length),
          ),
          ProductGrid(products: products),
          const SliverToBoxAdapter(
            child: SizedBox(height: UIConstants.spacingXXL),
          ),
        ],
      ),
      bottomNavigationBar: HomeBottomNav(
        selectedIndex: _selectedNavIndex,
        onIndexChanged: (i) => setState(() => _selectedNavIndex = i),
      ),
    );
  }
}
