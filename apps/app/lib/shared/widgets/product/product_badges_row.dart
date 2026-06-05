import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/ml-products/widgets/eco_score_badge.dart';
import 'package:flutter/material.dart';

class ProductBadgesRow extends StatelessWidget {
  final double? ecoScore;
  final int? stock;
  final bool showEcoBadge;
  final bool showStock;
  final bool compact;

  const ProductBadgesRow({
    super.key,
    this.ecoScore,
    this.stock,
    this.showEcoBadge = true,
    this.showStock = false,
    this.compact = true,
  });

  @override
  Widget build(BuildContext context) {
    final badges = <Widget>[
      if (showEcoBadge && ecoScore != null)
        EcoScoreBadge(score: ecoScore!, compact: compact),
      if (showStock && stock != null && stock! <= 0)
        const _Badge(label: 'Habis', color: Color(0xFF757575)),
      if (showStock && stock != null && stock! > 0 && stock! <= 5)
        _Badge(label: 'Sisa $stock', color: const Color(0xFFFF7043)),
    ];

    if (badges.isEmpty) return const SizedBox.shrink();

    return Wrap(
      spacing: UIConstants.spacingXS,
      runSpacing: UIConstants.spacingXS,
      children: badges,
    );
  }
}

class ProductCategoryBadge extends StatelessWidget {
  final String label;

  const ProductCategoryBadge({super.key, required this.label});

  @override
  Widget build(BuildContext context) {
    if (label.trim().isEmpty) return const SizedBox.shrink();

    return _Badge(
      label: label,
      color: AppTheme.primaryColor,
      backgroundColor: Colors.white.withValues(alpha: 0.92),
    );
  }
}

class ProductDiscountBadge extends StatelessWidget {
  final String label;

  const ProductDiscountBadge({super.key, required this.label});

  @override
  Widget build(BuildContext context) {
    if (label.trim().isEmpty) return const SizedBox.shrink();

    return _Badge(
      label: label,
      color: Colors.white,
      backgroundColor: const Color(0xFFFF7043),
      icon: Icons.local_offer_rounded,
    );
  }
}

class ProductFallbackBadge extends StatelessWidget {
  const ProductFallbackBadge({super.key});

  @override
  Widget build(BuildContext context) {
    return _Badge(
      label: 'Katalog',
      color: Colors.grey.shade700,
      backgroundColor: Colors.grey.shade200,
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color color;
  final Color? backgroundColor;
  final IconData? icon;

  const _Badge({
    required this.label,
    required this.color,
    this.backgroundColor,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: backgroundColor ?? color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.25), width: 0.8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 10, color: color),
            const SizedBox(width: 3),
          ],
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: color,
              fontSize: UIConstants.fontSizeXS,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}
