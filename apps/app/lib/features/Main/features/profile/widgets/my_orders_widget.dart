import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:Greenly/core/router/app_routes.dart';
import 'package:Greenly/features/order/service/order_service.dart';
import 'package:Greenly/shared/widgets/section_title_widget.dart';
import 'package:Greenly/shared/widgets/skeleton/app_skeleton_box.dart';
import 'package:flutter/material.dart';

class MyOrdersWidget extends StatefulWidget {
  const MyOrdersWidget({super.key});

  @override
  State<MyOrdersWidget> createState() => _MyOrdersWidgetState();
}

class _MyOrdersWidgetState extends State<MyOrdersWidget> {
  late Future<OrderSummaryData> _future;

  @override
  void initState() {
    super.initState();
    _future = OrderService().getOrderSummary();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<OrderSummaryData>(
      future: _future,
      builder: (context, snapshot) {
        final isLoading =
            snapshot.connectionState == ConnectionState.waiting;

        final summary = snapshot.data;

        final items = [
          _OrderStatusItem(
            label: 'Menunggu',
            icon: Icons.wallet_outlined,
            count: summary?.pending ?? 0,
            color: const Color(0xFFF59E0B),
          ),
          _OrderStatusItem(
            label: 'Diproses',
            icon: Icons.assignment_turned_in_outlined,
            count: (summary?.paid ?? 0) + (summary?.processing ?? 0),
            color: const Color(0xFF8B5CF6),
          ),
          _OrderStatusItem(
            label: 'Dikirim',
            icon: Icons.local_shipping_outlined,
            count: summary?.shipped ?? 0,
            color: const Color(0xFF0EA5E9),
          ),
          _OrderStatusItem(
            label: 'Selesai',
            icon: Icons.check_circle_outline,
            count: summary?.completed ?? 0,
            color: const Color(0xFF16A34A),
          ),
        ];

        return Column(
          children: [
            SectionTitleWidget(
              title: 'Pesanan Saya',
              onSeeAll: () {
                Navigator.pushNamed(context, AppRoutes.orders);
              },
            ),
            const SizedBox(height: UIConstants.spacingL),
            Row(
              children: items.map((item) {
                return Expanded(
                  child: isLoading
                      ? const _OrderStatusSkeleton()
                      : _buildOrderStatusItem(context, item),
                );
              }).toList(),
            ),
          ],
        );
      },
    );
  }

  Widget _buildOrderStatusItem(BuildContext context, _OrderStatusItem item) {
    return Column(
      children: [
        Stack(
          clipBehavior: Clip.none,
          children: [
            Container(
              padding: const EdgeInsets.all(
                UIConstants.paddingS + UIConstants.paddingXS,
              ),
              decoration: BoxDecoration(
                color: item.color.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(
                item.icon,
                size: UIConstants.iconSizeL,
                color: item.color,
              ),
            ),
            if (item.count > 0)
              Positioned(
                top: -UIConstants.paddingXS,
                right: -UIConstants.paddingXS,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal:
                        UIConstants.spacingS - UIConstants.spacingXS,
                    vertical: UIConstants.spacingXS / 2,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.redAccent.shade200,
                    borderRadius:
                        BorderRadius.circular(UIConstants.radiusM),
                  ),
                  constraints:
                      const BoxConstraints(minWidth: 18, minHeight: 18),
                  child: Text(
                    item.count > 99 ? '99+' : item.count.toString(),
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: UIConstants.fontSizeXS,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: UIConstants.spacingS),
        Text(
          item.label,
          style: const TextStyle(fontSize: UIConstants.fontSizeS),
        ),
      ],
    );
  }
}

class _OrderStatusSkeleton extends StatelessWidget {
  const _OrderStatusSkeleton();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: const [
        AppSkeletonBox(
          width: 48,
          height: 48,
          shape: BoxShape.circle,
        ),
        SizedBox(height: UIConstants.spacingS),
        AppSkeletonBox(width: 46, height: 12, radius: 4),
      ],
    );
  }
}

class _OrderStatusItem {
  final String label;
  final IconData icon;
  final int count;
  final Color color;

  const _OrderStatusItem({
    required this.label,
    required this.icon,
    required this.count,
    required this.color,
  });
}