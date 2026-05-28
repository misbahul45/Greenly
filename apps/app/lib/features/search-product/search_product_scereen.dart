import 'package:app/core/config/env.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/currency_helper.dart';
import 'package:flutter/material.dart';

class SearchProductScreen extends StatefulWidget {
  const SearchProductScreen({super.key});

  @override
  State<SearchProductScreen> createState() => _SearchProductScreenState();
}

class _SearchProductScreenState extends State<SearchProductScreen> {
  final TextEditingController _controller = TextEditingController();

  List<String> searchHistory = [];
  List<_SearchProductResult> results = [];
  bool isLoading = false;
  String? errorMessage;

  void _addSearch(String query) {
    if (query.trim().isEmpty) return;

    setState(() {
      searchHistory.remove(query);
      searchHistory.insert(0, query);
    });
  }

  Future<void> _search(String query) async {
    final keyword = query.trim();
    if (keyword.isEmpty) return;

    _addSearch(keyword);
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final mlResponse = await ApiClient.post<List<_SearchProductResult>>(
        '${ENV.API}/ml/search',
        {
          'query': keyword,
          'limit': 20,
        },
        fromJsonT: (json) => _SearchProductResult.listFromMl(json),
      );

      if (mlResponse.isSuccess && (mlResponse.data?.isNotEmpty ?? false)) {
        setState(() {
          results = mlResponse.data!;
          isLoading = false;
        });
        return;
      }

      final encodedKeyword = Uri.encodeQueryComponent(keyword);
      final catalogResponse = await ApiClient.get<List<_SearchProductResult>>(
        '${ENV.API}/catalog/products/search?q=$encodedKeyword&page=1&limit=20',
        fromJsonT: (json) => _SearchProductResult.listFromCatalog(json),
      );

      setState(() {
        results = catalogResponse.data ?? [];
        errorMessage = catalogResponse.isSuccess ? null : catalogResponse.message;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        errorMessage = e.toString();
        isLoading = false;
      });
    }
  }

  void _removeSearch(String query) {
    setState(() {
      searchHistory.remove(query);
    });
  }

  void _clearAll() {
    setState(() {
      searchHistory.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Search Product"),
        elevation: 0,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _controller,
              onSubmitted: (value) {
                _search(value);
              },
              decoration: InputDecoration(
                hintText: "Search product...",
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _controller.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () {
                          _controller.clear();
                          setState(() {});
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (_) {
                setState(() {});
              },
            ),
          ),

          if (isLoading) const LinearProgressIndicator(minHeight: 2),

          if (searchHistory.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "Recent Searches",
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  TextButton(
                    onPressed: _clearAll,
                    child: const Text("Clear All"),
                  )
                ],
              ),
            ),

          Expanded(
            child: _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    if (errorMessage != null) {
      return Center(child: Text(errorMessage!));
    }

    if (results.isNotEmpty) {
      return ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: results.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final product = results[index];
          return _SearchResultTile(product: product);
        },
      );
    }

    if (searchHistory.isEmpty) {
      return const Center(child: Text("No recent searches"));
    }

    return ListView.builder(
      itemCount: searchHistory.length,
      itemBuilder: (context, index) {
        final item = searchHistory[index];

        return ListTile(
          leading: const Icon(Icons.history),
          title: Text(item),
          trailing: IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => _removeSearch(item),
          ),
          onTap: () {
            _controller.text = item;
            _controller.selection = TextSelection.fromPosition(
              TextPosition(offset: item.length),
            );
            _search(item);
          },
        );
      },
    );
  }
}

class _SearchResultTile extends StatelessWidget {
  final _SearchProductResult product;

  const _SearchResultTile({required this.product});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: product.slug == null || product.slug!.isEmpty
          ? null
          : () {
              Navigator.pushNamed(
                context,
                AppRoutes.productDetail,
                arguments: product.slug,
              );
            },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: product.imageUrl == null || product.imageUrl!.isEmpty
                  ? Container(
                      width: 72,
                      height: 72,
                      color: Colors.grey.shade100,
                      child: const Icon(Icons.eco, color: AppTheme.primaryColor),
                    )
                  : Image.network(
                      product.imageUrl!,
                      width: 72,
                      height: 72,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        width: 72,
                        height: 72,
                        color: Colors.grey.shade100,
                        child: const Icon(Icons.image_not_supported_outlined),
                      ),
                    ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 6),
                  if (product.reason != null && product.reason!.isNotEmpty)
                    Text(
                      product.reason!,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                    ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text(
                        CurrencyHelper.formatRupiah(product.price ?? 0),
                        style: const TextStyle(
                          color: AppTheme.primaryColor,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      if (product.ecoScore != null) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            'Eco ${product.ecoScore!.round()}',
                            style: const TextStyle(
                              color: AppTheme.primaryColor,
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SearchProductResult {
  final String id;
  final String name;
  final String? slug;
  final int? price;
  final String? imageUrl;
  final double? ecoScore;
  final String? reason;

  _SearchProductResult({
    required this.id,
    required this.name,
    this.slug,
    this.price,
    this.imageUrl,
    this.ecoScore,
    this.reason,
  });

  factory _SearchProductResult.fromMl(Map<String, dynamic> json) {
    return _SearchProductResult(
      id: json['product_id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString(),
      price: (json['price'] as num?)?.round(),
      imageUrl: json['image_url']?.toString(),
      ecoScore: (json['eco_score'] as num?)?.toDouble(),
      reason: json['reason']?.toString(),
    );
  }

  factory _SearchProductResult.fromCatalog(Map<String, dynamic> json) {
    final imageUrls = json['imageUrls'];
    return _SearchProductResult(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString(),
      price: (json['price'] as num?)?.round(),
      imageUrl: imageUrls is List && imageUrls.isNotEmpty
          ? imageUrls.first.toString()
          : null,
      reason: json['description']?.toString(),
    );
  }

  static List<_SearchProductResult> listFromMl(dynamic json) {
    final items = json is List ? json : const [];
    return items
        .whereType<Map<String, dynamic>>()
        .map(_SearchProductResult.fromMl)
        .where((item) => item.id.isNotEmpty)
        .toList();
  }

  static List<_SearchProductResult> listFromCatalog(dynamic json) {
    final items = json is List
        ? json
        : json is Map<String, dynamic> && json['data'] is List
        ? json['data']
        : const [];
    return items
        .whereType<Map<String, dynamic>>()
        .map(_SearchProductResult.fromCatalog)
        .where((item) => item.id.isNotEmpty)
        .toList();
  }
}
