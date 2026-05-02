import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/shared/widgets/section_title.dart';
import 'package:flutter/material.dart';
import 'package:app/core/constants/ui_constants.dart';

class OrderStatusItem {
  final String label;
  final IconData icon;
  final int count;

  OrderStatusItem(this.label, this.icon, this.count);
}

class MyOrdersWidget extends StatelessWidget {
  const MyOrdersWidget({super.key});

  Widget _buildOrderStatusItem(BuildContext context, OrderStatusItem item) {
    return Column(
      children: [
        Stack(
          clipBehavior: Clip.none,
          children: [
            Container(
              padding: const EdgeInsets.all(UIConstants.paddingS + UIConstants.paddingXS),
              decoration: BoxDecoration(
                color: const Color(0xFFF5F5F5),
                shape: BoxShape.circle,
              ),
              child: Icon(
                item.icon,
                size: UIConstants.iconSizeL,
                color: AppTheme.primaryColor,
              ),
            ),
            if (item.count > 0)
              Positioned(
                top: -UIConstants.paddingXS,
                right: -UIConstants.paddingXS,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: UIConstants.spacingS - UIConstants.spacingXS,
                    vertical: UIConstants.spacingXS / 2,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.redAccent.shade200,
                    borderRadius: BorderRadius.circular(UIConstants.radiusM),
                  ),
                  constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                  child: Text(
                    item.count > 99 ? '99+' : item.count.toString(),
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: UIConstants.fontSizeXS,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                )
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

  @override
  Widget build(BuildContext context) {
    final items = [
      OrderStatusItem("Pending", Icons.wallet_outlined, 2),
      OrderStatusItem("Shipped", Icons.assignment_turned_in_outlined, 1),
      OrderStatusItem("Delivered", Icons.local_shipping_outlined, 0),
      OrderStatusItem("Cancelled", Icons.check_circle_outline, 3),
    ];

    return Column(
      children: [
        SectionTitle(
          title: "Pesanan Saya",
          onSeeAll: () {
            Navigator.pushNamed(context, AppRoutes.orders);
          },
        ),
        const SizedBox(height: UIConstants.spacingL),
        Row(
          children: items.map((item) {
            return Expanded(
              child: _buildOrderStatusItem(context, item),
            );
          }).toList(),
        ),
      ],
    );
  }
}