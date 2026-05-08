part of 'cart_bloc.dart';

class CartState extends Equatable {
  final CartData? cart;
  final bool isLoading;
  final Set<String> addingProductIds;
  final Set<String> removingProductIds;
  final String? error;

  const CartState({
    this.cart,
    this.isLoading = false,
    this.addingProductIds = const {},
    this.removingProductIds = const {},
    this.error,
  });

  int get totalItems => cart?.totalItems ?? 0;

  bool isAdding(String productId) => addingProductIds.contains(productId);
  bool isRemoving(String productId) => removingProductIds.contains(productId);

  CartState copyWith({
    CartData? cart,
    bool? isLoading,
    Set<String>? addingProductIds,
    Set<String>? removingProductIds,
    String? error,
  }) {
    return CartState(
      cart: cart ?? this.cart,
      isLoading: isLoading ?? this.isLoading,
      addingProductIds: addingProductIds ?? this.addingProductIds,
      removingProductIds: removingProductIds ?? this.removingProductIds,
      error: error,
    );
  }

  @override
  List<Object?> get props => [
    cart,
    isLoading,
    addingProductIds,
    removingProductIds,
    error,
  ];
}
