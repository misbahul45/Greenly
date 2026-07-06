import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:Greenly/core/theme/app_theme.dart';
import 'package:flutter/material.dart';

class ProgressStat extends StatelessWidget {
  final String label;
  final double value;
  final String? rightLabel;
  final Color color;

  const ProgressStat({
    super.key,
    required this.label,
    required this.value,
    this.rightLabel,
    this.color = AppTheme.primaryColor,
  });

  @override
  Widget build(BuildContext context) {
    final clamped = value.clamp(0.0, 1.0);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                label,
                style: const TextStyle(
                  fontSize: UIConstants.fontSizeS,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            if (rightLabel != null)
              Text(
                rightLabel!,
                style: TextStyle(
                  fontSize: UIConstants.fontSizeXS,
                  color: Colors.grey[600],
                  fontWeight: FontWeight.w700,
                ),
              ),
          ],
        ),
        const SizedBox(height: UIConstants.spacingXS),
        LayoutBuilder(
          builder: (context, constraints) {
            return Container(
              height: 8,
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(999),
              ),
              alignment: Alignment.centerLeft,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                width: constraints.maxWidth * clamped,
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}
