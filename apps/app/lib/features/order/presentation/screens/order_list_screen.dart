import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/core/utils/currency_helper.dart';
import 'package:app/features/order/domain/data/order_data.dart';
import 'package:app/features/order/presentation/bloc/order_bloc.dart';
import 'package:app/features/order/presentation/widgets/order_status_badge.dart';
import 'package:app/features/order/service/order_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

class OrderListScreen extends StatefulWidget {
  const OrderListScreen({super.key});

  @override
  State<OrderListScreen> createState() => _OrderListScreenState();
}

class _OrderListScreenState extends State<OrderListScreen> {
  late final OrderBloc _bloc;
  late final ScrollController _scrollController;

  static const _filters = <(String?, String)>[
    (null, 'Semua'),
    ('PENDING', 'Menunggu'),
    ('PAID', 'Dibayar'),
    ('PROCESSING', 'Diproses'),
    ('SHIPPED', 'Dikirim'),
    ('COMPLETED', 'Selesai'),
    ('CANCELLED', 'Batal'),
  ];

  @override
  void initState() {
    super.initState();
    _bloc = OrderBloc(OrderService())..add(const OrderListRequested());
    _scrollController = ScrollController()..addListener(_onScroll);
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final pos = _scrollController.position;
    if (pos.pixels >= pos.maxScrollExtent - 300) {
      _bloc.add(OrderLoadMoreRequested());
    }
  }

  @override
  void dispose() {
    _bloc.close();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: _bloc,
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
            'Pesanan Saya',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
          ),
        ),
        body: Column(
          children: [
            _buildFilterBar(),
            Expanded(
              child: BlocBuilder<OrderBloc, OrderState>(
                builder: (context, state) {
                  if (state.isLoading) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  if (state.error != null && state.data.isEmpty) {
                    return _ErrorView(
                      message: state.error!,
                      onRetry: () => _bloc.add(
                        OrderListRequested(status: state.statusFilter),
                      ),
                    );
                  }

                  if (state.data.isEmpty) {
                    return const _EmptyView();
                  }

                  return RefreshIndicator(
                    onRefresh: () async => _bloc.add(
                      OrderListRequested(status: state.statusFilter),
                    ),
                    child: ListView.separated(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(UIConstants.paddingM),
                      itemCount:
                          state.data.length + (state.isLoadingMore ? 1 : 0),
                      separatorBuilder: (_, _) =>
                          const SizedBox(height: UIConstants.spacingS),
                      itemBuilder: (context, i) {
                        if (i >= state.data.length) {
                          return const Padding(
                            padding: EdgeInsets.all(UIConstants.paddingM),
                            child: Center(child: CircularProgressIndicator()),
                          );
                        }
                        return _OrderCard(order: state.data[i]);
                      },
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterBar() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: UIConstants.spacingS),
      child: BlocBuilder<OrderBloc, OrderState>(
        buildWhen: (p, c) => p.statusFilter != c.statusFilter,
        builder: (context, state) {
          return SizedBox(
            height: 34,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(
                horizontal: UIConstants.paddingM,
              ),
              itemCount: _filters.length,
              separatorBuilder: (_, _) =>
                  const SizedBox(width: UIConstants.spacingS),
              itemBuilder: (context, i) {
                final (value, label) = _filters[i];
                final active = state.statusFilter == value;
                return GestureDetector(
                  onTap: () => _bloc.add(OrderListRequested(status: value)),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: active
                          ? AppTheme.primaryColor
                          : AppTheme.primaryColor.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      label,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: active ? Colors.white : AppTheme.primaryColor,
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final OrderData order;

  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(
        context,
        AppRoutes.orderDetail,
        arguments: order.id,
      ),
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.storefront_rounded,
                  size: 16,
                  color: AppTheme.primaryColor,
                ),
                const SizedBox(width: UIConstants.spacingXS),
                Expanded(
                  child: Text(
                    order.shopName.isEmpty ? 'Toko' : order.shopName,
                    style: const TextStyle(
                      fontSize: UIConstants.fontSizeM,
                      fontWeight: FontWeight.w700,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                OrderStatusBadge(status: order.status),
              ],
            ),
            const Divider(height: UIConstants.spacingL),
            if (order.items.isNotEmpty)
              Text(
                order.items.first.productName,
                style: TextStyle(
                  fontSize: UIConstants.fontSizeM,
                  color: Colors.grey[700],
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            if (order.items.length > 1)
              Padding(
                padding: const EdgeInsets.only(top: 2),
                child: Text(
                  '+${order.items.length - 1} produk lainnya',
                  style: TextStyle(
                    fontSize: UIConstants.fontSizeXS,
                    color: Colors.grey[400],
                  ),
                ),
              ),
            const SizedBox(height: UIConstants.spacingS),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  DateFormat('dd MMM yyyy', 'id_ID').format(order.createdAt),
                  style: TextStyle(
                    fontSize: UIConstants.fontSizeXS,
                    color: Colors.grey[500],
                  ),
                ),
                Text(
                  CurrencyHelper.formatRupiah(order.totalAmount),
                  style: const TextStyle(
                    fontSize: UIConstants.fontSizeL,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.primaryColor,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyView extends StatelessWidget {
  const _EmptyView();

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
              Icons.receipt_long_outlined,
              size: 48,
              color: AppTheme.primaryColor,
            ),
          ),
          const SizedBox(height: UIConstants.spacingXXL),
          const Text(
            'Belum Ada Pesanan',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: UIConstants.spacingS),
          Text(
            'Pesanan yang kamu buat akan muncul di sini',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: UIConstants.fontSizeM,
              color: Colors.grey[500],
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline_rounded, size: 48, color: Colors.grey[300]),
          const SizedBox(height: UIConstants.spacingM),
          Text(
            message,
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey[600]),
          ),
          const SizedBox(height: UIConstants.spacingM),
          ElevatedButton(onPressed: onRetry, child: const Text('Coba Lagi')),
        ],
      ),
    );
  }
}
