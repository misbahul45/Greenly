import 'package:flutter/material.dart';

class OrderStatusStyle {
  final Color color;
  final String label;

  const OrderStatusStyle(this.color, this.label);

  static OrderStatusStyle of(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return const OrderStatusStyle(Color(0xFFF59E0B), 'Menunggu');
      case 'PAID':
        return const OrderStatusStyle(Color(0xFF3B82F6), 'Dibayar');
      case 'PROCESSING':
        return const OrderStatusStyle(Color(0xFF8B5CF6), 'Diproses');
      case 'SHIPPED':
        return const OrderStatusStyle(Color(0xFF0EA5E9), 'Dikirim');
      case 'COMPLETED':
        return const OrderStatusStyle(Color(0xFF16A34A), 'Selesai');
      case 'CANCELLED':
        return const OrderStatusStyle(Color(0xFFEF4444), 'Dibatalkan');
      default:
        return OrderStatusStyle(Colors.grey.shade500, status);
    }
  }
}

class OrderStatusBadge extends StatelessWidget {
  final String status;

  const OrderStatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final style = OrderStatusStyle.of(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: style.color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        style.label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: style.color,
        ),
      ),
    );
  }
}
