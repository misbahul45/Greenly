import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/core/utils/currency_helper.dart';
import 'package:app/features/cart/domain/data/cart_item_data.dart';
import 'package:app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:app/features/order/domain/dto/checkout_dto.dart';
import 'package:app/features/order/service/order_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6FAF6),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        centerTitle: true,
        title: BlocBuilder<CartBloc, CartState>(
          buildWhen: (p, c) => p.totalItems != c.totalItems,
          builder: (context, state) {
            return Text(
              'Keranjang (${state.totalItems})',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            );
          },
        ),
        actions: [
          BlocBuilder<CartBloc, CartState>(
            buildWhen: (p, c) => p.cart != c.cart,
            builder: (context, state) {
              if (state.cart == null || state.cart!.items.isEmpty) {
                return const SizedBox.shrink();
              }
              return TextButton(
                onPressed: () => _showClearDialog(context),
                child: const Text(
                  'Kosongkan',
                  style: TextStyle(color: Colors.red, fontSize: 13),
                ),
              );
            },
          ),
        ],
      ),
      body: BlocConsumer<CartBloc, CartState>(
        listenWhen: (p, c) => c.error != null && p.error != c.error,
        listener: (context, state) {
          if (state.error != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.error!),
                backgroundColor: Colors.red,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final groups = state.cart?.groupedByShop ?? const [];

          if (groups.isEmpty) {
            return const _EmptyCart();
          }

          return ListView.separated(
            padding: const EdgeInsets.all(UIConstants.paddingM),
            itemCount: groups.length,
            separatorBuilder: (_, _) =>
                const SizedBox(height: UIConstants.spacingM),
            itemBuilder: (context, i) => _ShopGroupCard(group: groups[i]),
          );
        },
      ),
    );
  }

  void _showClearDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: const Text('Kosongkan Keranjang'),
        content: const Text('Semua item akan dihapus dari keranjang.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () {
              Navigator.pop(dialogCtx);
              context.read<CartBloc>().add(CartClearRequested());
            },
            child: const Text('Kosongkan'),
          ),
        ],
      ),
    );
  }
}

class _ShopGroupCard extends StatelessWidget {
  final CartShopGroup group;

  const _ShopGroupCard({required this.group});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(UIConstants.radiusL),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
              UIConstants.paddingM,
              UIConstants.paddingM,
              UIConstants.paddingM,
              UIConstants.spacingS,
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.storefront_rounded,
                  size: 18,
                  color: AppTheme.primaryColor,
                ),
                const SizedBox(width: UIConstants.spacingS),
                Expanded(
                  child: Text(
                    group.shopName,
                    style: const TextStyle(
                      fontSize: UIConstants.fontSizeL,
                      fontWeight: FontWeight.w700,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          ...group.items.map(
            (item) => Padding(
              padding: const EdgeInsets.fromLTRB(
                UIConstants.paddingM,
                UIConstants.spacingS,
                UIConstants.paddingM,
                UIConstants.spacingS,
              ),
              child: _CartItemRow(item: item),
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.all(UIConstants.paddingM),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Subtotal (${group.totalQuantity} item)',
                        style: TextStyle(
                          fontSize: UIConstants.fontSizeXS,
                          color: Colors.grey[500],
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        CurrencyHelper.formatRupiah(group.subtotal),
                        style: const TextStyle(
                          fontSize: UIConstants.fontSizeL,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: group.shopId.isEmpty
                      ? null
                      : () => _openCheckoutSheet(context, group),
                  child: const Text(
                    'Checkout',
                    style: TextStyle(
                      fontSize: UIConstants.fontSizeM,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _openCheckoutSheet(BuildContext context, CartShopGroup group) {
    final cartBloc = context.read<CartBloc>();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _CheckoutSheet(group: group, cartBloc: cartBloc),
    );
  }
}

class _CartItemRow extends StatelessWidget {
  final CartItemData item;

  const _CartItemRow({required this.item});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CartBloc, CartState>(
      buildWhen: (p, c) =>
          p.isRemoving(item.productId) != c.isRemoving(item.productId) ||
          p.cart != c.cart,
      builder: (context, state) {
        final removing = state.isRemoving(item.productId);

        return AnimatedOpacity(
          opacity: removing ? 0.4 : 1.0,
          duration: const Duration(milliseconds: 200),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(UIConstants.radiusM),
                child: item.productImageUrl != null
                    ? Image.network(
                        item.productImageUrl!,
                        width: 64,
                        height: 64,
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => _placeholder(),
                      )
                    : _placeholder(),
              ),
              const SizedBox(width: UIConstants.spacingM),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.productName ?? 'Produk',
                      style: const TextStyle(
                        fontSize: UIConstants.fontSizeM,
                        fontWeight: FontWeight.w600,
                        color: Colors.black87,
                        height: 1.3,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (item.productPrice != null) ...[
                      const SizedBox(height: UIConstants.spacingXS),
                      Text(
                        CurrencyHelper.formatRupiah(item.productPrice!),
                        style: const TextStyle(
                          fontSize: UIConstants.fontSizeM,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                    ],
                    const SizedBox(height: UIConstants.spacingS),
                    _QuantityControl(item: item),
                  ],
                ),
              ),
              const SizedBox(width: UIConstants.spacingS),
              GestureDetector(
                onTap: removing
                    ? null
                    : () => context.read<CartBloc>().add(
                        CartRemoveItemRequested(productId: item.productId),
                      ),
                child: removing
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.red,
                        ),
                      )
                    : const Icon(
                        Icons.delete_outline_rounded,
                        size: 20,
                        color: Colors.red,
                      ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _placeholder() {
    return Container(
      width: 64,
      height: 64,
      decoration: BoxDecoration(
        color: AppTheme.tertiaryColor.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(UIConstants.radiusM),
      ),
      child: const Icon(
        Icons.shopping_bag_outlined,
        color: AppTheme.primaryColor,
        size: 28,
      ),
    );
  }
}

class _QuantityControl extends StatelessWidget {
  final CartItemData item;

  const _QuantityControl({required this.item});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _QtyButton(
          icon: Icons.remove_rounded,
          onTap: item.quantity <= 1
              ? null
              : () => context.read<CartBloc>().add(
                  CartUpdateItemRequested(
                    productId: item.productId,
                    quantity: item.quantity - 1,
                  ),
                ),
        ),
        Container(
          width: 32,
          alignment: Alignment.center,
          child: Text(
            '${item.quantity}',
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
          ),
        ),
        _QtyButton(
          icon: Icons.add_rounded,
          onTap: () => context.read<CartBloc>().add(
            CartUpdateItemRequested(
              productId: item.productId,
              quantity: item.quantity + 1,
            ),
          ),
        ),
      ],
    );
  }
}

class _QtyButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;

  const _QtyButton({required this.icon, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          color: onTap == null
              ? Colors.grey[100]
              : AppTheme.primaryColor.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(UIConstants.radiusS),
          border: Border.all(
            color: onTap == null
                ? Colors.grey[200]!
                : AppTheme.primaryColor.withValues(alpha: 0.3),
          ),
        ),
        child: Icon(
          icon,
          size: 16,
          color: onTap == null ? Colors.grey[400] : AppTheme.primaryColor,
        ),
      ),
    );
  }
}

class _CheckoutSheet extends StatefulWidget {
  final CartShopGroup group;
  final CartBloc cartBloc;

  const _CheckoutSheet({required this.group, required this.cartBloc});

  @override
  State<_CheckoutSheet> createState() => _CheckoutSheetState();
}

class _CheckoutSheetState extends State<_CheckoutSheet> {
  static const _methods = <(String, String, IconData)>[
    ('bank_transfer', 'Transfer Bank', Icons.account_balance_rounded),
    ('gopay', 'GoPay', Icons.account_balance_wallet_rounded),
    ('ovo', 'OVO', Icons.account_balance_wallet_outlined),
    ('dana', 'DANA', Icons.payments_rounded),
    ('credit_card', 'Kartu Kredit', Icons.credit_card_rounded),
  ];

  final _promoController = TextEditingController();
  final _orderService = OrderService();
  String _method = 'bank_transfer';
  bool _loading = false;

  @override
  void dispose() {
    _promoController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _loading = true);

    final res = await _orderService.checkout(
      CheckoutDto(
        shopId: widget.group.shopId,
        shopName: widget.group.shopName,
        itemIds: widget.group.productIds,
        paymentMethod: _method,
        promoCode: _promoController.text.trim().isEmpty
            ? null
            : _promoController.text.trim(),
      ),
    );

    if (!mounted) return;
    setState(() => _loading = false);

    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);

    if (res.isSuccess) {
      widget.cartBloc.add(CartLoadRequested());
      navigator.pop();
      messenger.showSnackBar(
        SnackBar(
          content: const Text('Checkout berhasil'),
          backgroundColor: AppTheme.primaryColor,
          action: SnackBarAction(
            label: 'Lihat Pesanan',
            textColor: Colors.white,
            onPressed: () => navigator.pushNamed(AppRoutes.orders),
          ),
        ),
      );
    } else {
      messenger.showSnackBar(
        SnackBar(content: Text(res.message), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: UIConstants.paddingL,
        right: UIConstants.paddingL,
        top: UIConstants.paddingL,
        bottom: MediaQuery.of(context).viewInsets.bottom + UIConstants.paddingL,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: UIConstants.spacingL),
          Text(
            'Checkout · ${widget.group.shopName}',
            style: const TextStyle(
              fontSize: UIConstants.fontSizeXL,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: UIConstants.spacingXS),
          Text(
            '${widget.group.totalQuantity} item · ${CurrencyHelper.formatRupiah(widget.group.subtotal)}',
            style: TextStyle(
              fontSize: UIConstants.fontSizeM,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: UIConstants.spacingL),
          const Text(
            'Metode Pembayaran',
            style: TextStyle(
              fontSize: UIConstants.fontSizeM,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: UIConstants.spacingS),
          ..._methods.map((m) {
            final selected = _method == m.$1;
            return GestureDetector(
              onTap: _loading ? null : () => setState(() => _method = m.$1),
              child: Container(
                margin: const EdgeInsets.only(bottom: UIConstants.spacingS),
                padding: const EdgeInsets.all(UIConstants.paddingM),
                decoration: BoxDecoration(
                  color: selected
                      ? AppTheme.primaryColor.withValues(alpha: 0.06)
                      : Colors.white,
                  borderRadius: BorderRadius.circular(UIConstants.radiusM),
                  border: Border.all(
                    color: selected
                        ? AppTheme.primaryColor
                        : Colors.grey.shade200,
                    width: selected ? 1.5 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      m.$3,
                      size: 20,
                      color: selected
                          ? AppTheme.primaryColor
                          : Colors.grey[500],
                    ),
                    const SizedBox(width: UIConstants.spacingM),
                    Expanded(
                      child: Text(
                        m.$2,
                        style: TextStyle(
                          fontSize: UIConstants.fontSizeM,
                          fontWeight: selected
                              ? FontWeight.w700
                              : FontWeight.w500,
                        ),
                      ),
                    ),
                    if (selected)
                      const Icon(
                        Icons.check_circle_rounded,
                        size: 18,
                        color: AppTheme.primaryColor,
                      ),
                  ],
                ),
              ),
            );
          }),
          const SizedBox(height: UIConstants.spacingS),
          TextField(
            controller: _promoController,
            enabled: !_loading,
            decoration: InputDecoration(
              hintText: 'Kode promo (opsional)',
              prefixIcon: const Icon(Icons.local_offer_outlined, size: 18),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: UIConstants.paddingM,
                vertical: 12,
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(UIConstants.radiusM),
              ),
            ),
          ),
          const SizedBox(height: UIConstants.spacingL),
          SizedBox(
            width: double.infinity,
            height: UIConstants.buttonHeight,
            child: ElevatedButton(
              onPressed: _loading ? null : _submit,
              child: _loading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text(
                      'Bayar Sekarang',
                      style: TextStyle(
                        fontSize: UIConstants.fontSizeL,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyCart extends StatelessWidget {
  const _EmptyCart();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: AppTheme.tertiaryColor.withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.shopping_cart_outlined,
              size: 48,
              color: AppTheme.primaryColor,
            ),
          ),
          const SizedBox(height: UIConstants.spacingXXL),
          const Text(
            'Keranjang Kosong',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: UIConstants.spacingS),
          Text(
            'Tambahkan produk ke keranjang\nuntuk mulai belanja',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: UIConstants.fontSizeM,
              color: Colors.grey[500],
              height: 1.5,
            ),
          ),
          const SizedBox(height: UIConstants.spacingXXXL),
          ElevatedButton.icon(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.explore_outlined, size: 18),
            label: const Text('Jelajahi Produk'),
          ),
        ],
      ),
    );
  }
}
