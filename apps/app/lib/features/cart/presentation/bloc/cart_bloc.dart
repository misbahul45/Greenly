import 'package:app/features/cart/domain/data/cart_item_data.dart';
import 'package:app/features/cart/service/cart_service.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

part 'cart_event.dart';
part 'cart_state.dart';

class CartBloc extends Bloc<CartEvent, CartState> {
  final CartService _service;

  CartBloc(this._service) : super(const CartState()) {
    on<CartLoadRequested>(_onLoad);
    on<CartAddItemRequested>(_onAddItem);
    on<CartUpdateItemRequested>(_onUpdateItem);
    on<CartRemoveItemRequested>(_onRemoveItem);
    on<CartClearRequested>(_onClear);
  }

  Future<void> _onLoad(CartLoadRequested event, Emitter<CartState> emit) async {
    emit(state.copyWith(isLoading: true, error: null));
    final res = await _service.getCart();
    if (res.isSuccess && res.data != null) {
      emit(state.copyWith(isLoading: false, cart: res.data));
    } else {
      emit(state.copyWith(isLoading: false, error: res.message));
    }
  }

  Future<void> _onAddItem(
    CartAddItemRequested event,
    Emitter<CartState> emit,
  ) async {
    emit(
      state.copyWith(
        addingProductIds: {...state.addingProductIds, event.productId},
        error: null,
      ),
    );
    final res = await _service.addItem(
      productId: event.productId,
      quantity: event.quantity,
    );
    final updated = Set<String>.from(state.addingProductIds)
      ..remove(event.productId);
    if (res.isSuccess && res.data != null) {
      emit(state.copyWith(addingProductIds: updated, cart: res.data));
    } else {
      emit(state.copyWith(addingProductIds: updated, error: res.message));
    }
  }

  Future<void> _onUpdateItem(
    CartUpdateItemRequested event,
    Emitter<CartState> emit,
  ) async {
    final res = await _service.updateItem(
      productId: event.productId,
      quantity: event.quantity,
    );
    if (res.isSuccess && res.data != null) {
      emit(state.copyWith(cart: res.data));
    } else {
      emit(state.copyWith(error: res.message));
    }
  }

  Future<void> _onRemoveItem(
    CartRemoveItemRequested event,
    Emitter<CartState> emit,
  ) async {
    emit(
      state.copyWith(
        removingProductIds: {...state.removingProductIds, event.productId},
      ),
    );
    await _service.removeItem(productId: event.productId);
    final updated = Set<String>.from(state.removingProductIds)
      ..remove(event.productId);
    emit(state.copyWith(removingProductIds: updated));
    add(CartLoadRequested());
  }

  Future<void> _onClear(
    CartClearRequested event,
    Emitter<CartState> emit,
  ) async {
    emit(state.copyWith(isLoading: true));
    await _service.clearCart();
    emit(
      state.copyWith(
        isLoading: false,
        cart: CartData(
          userId: state.cart?.userId ?? '',
          items: [],
          totalItems: 0,
        ),
      ),
    );
  }
}
