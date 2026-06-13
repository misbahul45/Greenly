import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';
import 'package:app/features/cart/domain/data/cart_item_data.dart';

class CartService {
  static String get _base => '${ENV.coreApiUrl}/cart';
  static String get _coreBase => ENV.coreApiUrl;
  static String get _catalogBase => ENV.catalogApiUrl;

  final Map<String, String> _shopNameCache = {};

  Future<ApiResponse<CartData>> getCart() async {
    final res = await ApiClient.get(
      _base,
      fromJsonT: (json) => CartData.fromJson(json),
    );

    return _withEnrichment(res);
  }

  Future<ApiResponse<CartData>> _withEnrichment(
    ApiResponse<CartData> res,
  ) async {
    if (!res.isSuccess || res.data == null || res.data!.items.isEmpty) {
      return res;
    }

    final enriched = await _enrichItems(res.data!.items);
    return ApiResponse(
      status: res.status,
      statusCode: res.statusCode,
      path: res.path,
      message: res.message,
      timestamp: res.timestamp,
      data: res.data!.copyWith(items: enriched),
    );
  }

  int? _parsePrice(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value.toString()) ??
        num.tryParse(value.toString())?.toInt();
  }

  Future<List<CartItemData>> _enrichItems(List<CartItemData> items) async {
    final futures = items.map((item) async {
      try {
        final res = await ApiClient.get<Map<String, dynamic>>(
          '$_catalogBase/products/${item.productId}',
          fromJsonT: (json) => json as Map<String, dynamic>,
        );
        if (res.isSuccess && res.data != null) {
          final p = res.data!;
          final images = (p['imageUrls'] as List<dynamic>? ?? []);
          return item.copyWith(
            productName: p['name']?.toString(),
            productImageUrl: images.isNotEmpty ? images.first.toString() : null,
            productPrice: _parsePrice(p['price']),
            shopId: p['shopId']?.toString(),
            shopName: p['shopName']?.toString(),
            slug: p['slug']?.toString(),
            stock: (p['stock'] as num?)?.toInt(),
            rating: (p['ratingAverage'] as num?)?.toDouble(),
            categoryName: p['categoryName']?.toString(),
          );
        }
      } catch (_) {}
      return item;
    });

    final withProduct = await Future.wait(futures);
    final needsShopLookup = withProduct.any(
      (item) =>
          item.shopId != null &&
          (item.shopName == null || item.shopName!.isEmpty),
    );
    return needsShopLookup ? _attachShopNames(withProduct) : withProduct;
  }

  Future<List<CartItemData>> _attachShopNames(List<CartItemData> items) async {
    final shopIds = items
        .map((e) => e.shopId)
        .whereType<String>()
        .where((id) => id.isNotEmpty)
        .toSet();

    await Future.wait(
      shopIds.where((id) => !_shopNameCache.containsKey(id)).map((id) async {
        try {
          final res = await ApiClient.get<Map<String, dynamic>>(
            '$_coreBase/shops/$id',
            fromJsonT: (json) => json as Map<String, dynamic>,
          );
          if (res.isSuccess && res.data != null) {
            final name = res.data!['name']?.toString();
            if (name != null && name.isNotEmpty) {
              _shopNameCache[id] = name;
            }
          }
        } catch (_) {}
      }),
    );

    return items.map((item) {
      final name = item.shopId == null ? null : _shopNameCache[item.shopId];
      return name == null ? item : item.copyWith(shopName: name);
    }).toList();
  }

  Future<ApiResponse<CartData>> addItem({
    required String productId,
    int quantity = 1,
  }) async {
    final res = await ApiClient.post('$_base/items', {
      'productId': productId,
      'quantity': quantity,
    }, fromJsonT: (json) => CartData.fromJson(json));

    return _withEnrichment(res);
  }

  Future<ApiResponse<CartData>> updateItem({
    required String productId,
    required int quantity,
  }) async {
    final res = await ApiClient.put('$_base/items/$productId', {
      'quantity': quantity,
    }, fromJsonT: (json) => CartData.fromJson(json));

    return _withEnrichment(res);
  }

  Future<ApiResponse<dynamic>> removeItem({required String productId}) async {
    return await ApiClient.delete('$_base/items/$productId');
  }

  Future<ApiResponse<dynamic>> clearCart() async {
    return await ApiClient.delete(_base);
  }
}
