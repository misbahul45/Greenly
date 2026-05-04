import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/core/utils/currency_helper.dart';
import 'package:app/features/cart/domain/data/cart_item_data.dart';
import 'package:app/features/cart/presentation/bloc/cart_bloc.dart';
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

          final items = state.cart?.items ?? [];

          if (items.isEmpty) {
            return const _EmptyCart();
          }

          return ListView.separated(
            padding: const EdgeInsets.all(UIConstants.paddingM),
            itemCount: items.length,
            separatorBuilder: (_, _) =>
                const SizedBox(height: UIConstants.spacingS),
            itemBuilder: (context, i) => _CartItemCard(item: items[i]),
          );
        },
      ),
      bottomNavigationBar: BlocBuilder<CartBloc, CartState>(
        buildWhen: (p, c) => p.cart != c.cart || p.isLoading != c.isLoading,
        builder: (context, state) {
          final items = state.cart?.items ?? [];
          if (items.isEmpty) return const SizedBox.shrink();

          return Container(
            padding: const EdgeInsets.fromLTRB(
              UIConstants.paddingM,
              UIConstants.spacingM,
              UIConstants.paddingM,
              UIConstants.spacingM,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.08),
                  blurRadius: 12,
                  offset: const Offset(0, -3),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${items.length} produk',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[500],
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${items.fold(0, (sum, i) => sum + i.quantity)} item',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(
                    height: UIConstants.buttonHeight,
                    child: ElevatedButton(
                      onPressed: () {},
                      child: const Text(
                        'Checkout',
                        style: TextStyle(
                          fontSize: UIConstants.fontSizeL,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
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

class _CartItemCard extends StatelessWidget {
  final CartItemData item;

  const _CartItemCard({required this.item});

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
          child: Container(
            padding: const EdgeInsets.all(UIConstants.paddingM),
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
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(UIConstants.radiusM),
                  child: item.productImageUrl != null
                      ? Image.network(
                          item.productImageUrl!,
                          width: 72,
                          height: 72,
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
          ),
        );
      },
    );
  }

  Widget _placeholder() {
    return Container(
      width: 72,
      height: 72,
      decoration: BoxDecoration(
        color: AppTheme.tertiaryColor.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(UIConstants.radiusM),
      ),
      child: const Icon(
        Icons.shopping_bag_outlined,
        color: AppTheme.primaryColor,
        size: 30,
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
