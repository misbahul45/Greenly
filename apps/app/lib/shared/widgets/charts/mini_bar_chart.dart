import 'package:app/core/theme/app_theme.dart';
import 'package:flutter/material.dart';

class MiniBarChart extends StatelessWidget {
  final List<double> values;
  final Color color;
  final double height;

  const MiniBarChart({
    super.key,
    required this.values,
    this.color = AppTheme.primaryColor,
    this.height = 88,
  });

  @override
  Widget build(BuildContext context) {
    if (values.isEmpty) return const SizedBox.shrink();
    final maxValue = values.reduce((a, b) => a > b ? a : b);
    final normalized = maxValue <= 0
        ? values.map((_) => 0.0).toList()
        : values.map((value) => value / maxValue).toList();

    return SizedBox(
      height: height,
      width: double.infinity,
      child: CustomPaint(
        painter: _MiniBarPainter(values: normalized, color: color),
      ),
    );
  }
}

class _MiniBarPainter extends CustomPainter {
  final List<double> values;
  final Color color;

  const _MiniBarPainter({required this.values, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final trackPaint = Paint()
      ..color = Colors.grey.shade200
      ..style = PaintingStyle.fill;
    final barPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final gap = 8.0;
    final count = values.length;
    final barWidth = ((size.width - gap * (count - 1)) / count).clamp(
      8.0,
      28.0,
    );
    final totalWidth = barWidth * count + gap * (count - 1);
    var x = (size.width - totalWidth) / 2;

    for (final raw in values) {
      final radius = Radius.circular(barWidth / 2);
      final track = RRect.fromRectAndRadius(
        Rect.fromLTWH(x, 0, barWidth, size.height),
        radius,
      );
      canvas.drawRRect(track, trackPaint);

      final value = raw.clamp(0.0, 1.0);
      final barHeight = (size.height * value).clamp(4.0, size.height);
      final bar = RRect.fromRectAndRadius(
        Rect.fromLTWH(x, size.height - barHeight, barWidth, barHeight),
        radius,
      );
      canvas.drawRRect(bar, barPaint);
      x += barWidth + gap;
    }
  }

  @override
  bool shouldRepaint(covariant _MiniBarPainter oldDelegate) {
    return oldDelegate.values != values || oldDelegate.color != color;
  }
}
