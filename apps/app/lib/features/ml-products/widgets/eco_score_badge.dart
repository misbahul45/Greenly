import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:Greenly/core/theme/app_theme.dart';
import 'package:flutter/material.dart';

class EcoScoreBadge extends StatelessWidget {
  final double score;
  final bool compact;

  const EcoScoreBadge({super.key, required this.score, this.compact = false});

  @override
  Widget build(BuildContext context) {
    final color = _colorForScore(score);
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 6 : 8,
        vertical: compact ? 2 : 3,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.35), width: 0.8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.eco_rounded, size: compact ? 10 : 12, color: color),
          const SizedBox(width: 3),
          Text(
            'Eco ${score.round()}',
            style: TextStyle(
              fontSize: compact
                  ? UIConstants.fontSizeXS - 1
                  : UIConstants.fontSizeXS,
              color: color,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  static Color _colorForScore(double s) {
    if (s >= 80) return AppTheme.primaryColor;
    if (s >= 60) return const Color(0xFF558B2F);
    if (s >= 40) return const Color(0xFFFFA000);
    return const Color(0xFFE64A19);
  }
}
