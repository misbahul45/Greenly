import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/core/utils/currency_helper.dart';
import 'package:app/features/order/domain/data/order_data.dart';
import 'package:app/features/order/presentation/bloc/order_bloc.dart';
import 'package:app/features/order/presentation/widgets/order_status_badge.dart';
import 'package:app/features/order/service/order_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

class OrderDetailScreen extends StatelessWidget {
  final String orderId;

  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          OrderBloc(OrderService())..add(OrderDetailRequested(orderId)),
      child: Scaffold(
        backgroundColor: const Color(0xFFF6FAF6),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
            onPressed: () => Navigator.pop(context),
          ),
          centerTitle: true,
          title: const Text(
            'Detail Pesanan',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
          ),
        ),
        body: BlocBuilder<OrderBloc, OrderState>(
          buildWhen: (p, c) =>
              p.isDetailLoading != c.isDetailLoading ||
              p.detail != c.detail ||
              p.detailError != c.detailError,
          builder: (context, state) {
            if (state.isDetailLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            final order = state.detail;
            if (order == null) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.error_outline_rounded,
                      size: 48,
                      color: Colors.grey[300],
                    ),
                    const SizedBox(height: UIConstants.spacingM),
                    Text(
                      state.detailError ?? 'Pesanan tidak ditemukan',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ],
                ),
              );
            }

            return ListView(
              padding: const EdgeInsets.all(UIConstants.paddingM),
              children: [
                _statusCard(order),
                const SizedBox(height: UIConstants.spacingS),
                _itemsCard(order),
                const SizedBox(height: UIConstants.spacingS),
                if (order.payment != null) _paymentCard(order),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _card({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(UIConstants.paddingM),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(UIConstants.radiusL),
      ),
      child: child,
    );
  }

  Widget _statusCard(OrderData order) {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  'Order #${order.id.length > 8 ? order.id.substring(order.id.length - 8).toUpperCase() : order.id.toUpperCase()}',
                  style: const TextStyle(
                    fontSize: UIConstants.fontSizeM,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              OrderStatusBadge(status: order.status),
            ],
          ),
          const SizedBox(height: UIConstants.spacingXS),
          Text(
            DateFormat('dd MMM yyyy, HH:mm', 'id_ID').format(order.createdAt),
            style: TextStyle(
              fontSize: UIConstants.fontSizeXS,
              color: Colors.grey[500],
            ),
          ),
          const Divider(height: UIConstants.spacingL),
          Row(
            children: [
              const Icon(
                Icons.storefront_rounded,
                size: 16,
                color: AppTheme.primaryColor,
              ),
              const SizedBox(width: UIConstants.spacingXS),
              Text(
                order.shopName.isEmpty ? 'Toko' : order.shopName,
                style: const TextStyle(
                  fontSize: UIConstants.fontSizeM,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _itemsCard(OrderData order) {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Produk',
            style: TextStyle(
              fontSize: UIConstants.fontSizeL,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: UIConstants.spacingS),
          ...order.items.map(
            (item) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: AppTheme.tertiaryColor.withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(UIConstants.radiusM),
                    ),
                    child: Text(
                      'x${item.quantity}',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                  ),
                  const SizedBox(width: UIConstants.spacingS),
                  Expanded(
                    child: Text(
                      item.productName,
                      style: const TextStyle(fontSize: UIConstants.fontSizeM),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: UIConstants.spacingS),
                  Text(
                    CurrencyHelper.formatRupiah(item.price * item.quantity),
                    style: const TextStyle(
                      fontSize: UIConstants.fontSizeM,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const Divider(height: UIConstants.spacingL),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Total',
                style: TextStyle(
                  fontSize: UIConstants.fontSizeL,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                CurrencyHelper.formatRupiah(order.totalAmount),
                style: const TextStyle(
                  fontSize: UIConstants.fontSizeXL,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.primaryColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _paymentCard(OrderData order) {
    final payment = order.payment!;
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Pembayaran',
            style: TextStyle(
              fontSize: UIConstants.fontSizeL,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: UIConstants.spacingS),
          _row('Metode', payment.method.isEmpty ? '-' : payment.method),
          _row('Status', payment.status),
          if (payment.paidAt != null)
            _row(
              'Dibayar',
              DateFormat('dd MMM yyyy, HH:mm', 'id_ID').format(payment.paidAt!),
            ),
        ],
      ),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: UIConstants.fontSizeM,
              color: Colors.grey[500],
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: UIConstants.fontSizeM,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
