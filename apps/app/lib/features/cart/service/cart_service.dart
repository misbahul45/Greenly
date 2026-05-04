import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';
import 'package:app/features/cart/domain/data/cart_item_data.dart';

class CartService {
  static String get _base => '${ENV.API}/core/cart';
  static String get _catalogBase => '${ENV.API}/catalog';

  Future<ApiResponse<CartData>> getCart() async {
    final res = await ApiClient.get(
      _base,
      fromJsonT: (json) => CartData.fromJson(json),
    );

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
            productPrice: p['price'] is int ? p['price'] as int : null,
          );
        }
      } catch (_) {}
      return item;
    });

    return await Future.wait(futures);
  }

  Future<ApiResponse<CartData>> addItem({
    required String productId,
    int quantity = 1,
  }) async {
    final res = await ApiClient.post('$_base/items', {
      'productId': productId,
      'quantity': quantity,
    }, fromJsonT: (json) => CartData.fromJson(json));

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

  Future<ApiResponse<CartData>> updateItem({
    required String productId,
    required int quantity,
  }) async {
    final res = await ApiClient.put('$_base/items/$productId', {
      'quantity': quantity,
    }, fromJsonT: (json) => CartData.fromJson(json));

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

  Future<ApiResponse<dynamic>> removeItem({required String productId}) async {
    return await ApiClient.delete('$_base/items/$productId');
  }

  Future<ApiResponse<dynamic>> clearCart() async {
    return await ApiClient.delete(_base);
  }
}
