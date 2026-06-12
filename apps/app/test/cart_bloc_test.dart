import 'package:app/core/utils/api_response.dart';
import 'package:app/features/cart/domain/data/cart_item_data.dart';
import 'package:app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:app/features/cart/service/cart_service.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('CartBloc', () {
    test('remove failure preserves cart and emits error', () async {
      final cart = CartData(
        userId: 'user-1',
        totalItems: 1,
        items: [
          CartItemData(
            id: 'item-1',
            productId: 'product-1',
            quantity: 1,
            createdAt: DateTime(2026),
          ),
        ],
      );
      final bloc = CartBloc(_FakeCartService(cart: cart, removeSuccess: false));
      addTearDown(bloc.close);

      bloc.add(CartLoadRequested());
      await expectLater(
        bloc.stream,
        emitsThrough(predicate<CartState>((state) => state.cart == cart)),
      );

      bloc.add(const CartRemoveItemRequested(productId: 'product-1'));
      await expectLater(
        bloc.stream,
        emitsThrough(
          predicate<CartState>(
            (state) =>
                state.error == 'remove failed' && state.cart?.items.length == 1,
          ),
        ),
      );
    });
  });
}

class _FakeCartService implements CartService {
  _FakeCartService({required this.cart, required this.removeSuccess});

  final CartData cart;
  final bool removeSuccess;

  @override
  Future<ApiResponse<CartData>> getCart() async {
    return ApiResponse<CartData>(
      status: 'success',
      statusCode: 200,
      path: '/cart',
      message: 'ok',
      timestamp: DateTime(2026).toIso8601String(),
      data: cart,
    );
  }

  @override
  Future<ApiResponse<CartData>> addItem({
    required String productId,
    int quantity = 1,
  }) async {
    return getCart();
  }

  @override
  Future<ApiResponse<CartData>> updateItem({
    required String productId,
    required int quantity,
  }) async {
    return getCart();
  }

  @override
  Future<ApiResponse<dynamic>> removeItem({required String productId}) async {
    return ApiResponse<dynamic>(
      status: removeSuccess ? 'success' : 'error',
      statusCode: removeSuccess ? 200 : 500,
      path: '/cart/items/$productId',
      message: removeSuccess ? 'ok' : 'remove failed',
      timestamp: DateTime(2026).toIso8601String(),
    );
  }

  @override
  Future<ApiResponse<dynamic>> clearCart() async {
    return ApiResponse<dynamic>(
      status: 'success',
      statusCode: 200,
      path: '/cart',
      message: 'ok',
      timestamp: DateTime(2026).toIso8601String(),
    );
  }
}
