import 'package:app/core/constants/ui_constants.dart';
import 'package:flutter/material.dart';

class AppSkeletonCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry? margin;
  final double radius;

  const AppSkeletonCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(UIConstants.paddingM),
    this.margin,
    this.radius = UIConstants.radiusL,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin,
      padding: padding,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(radius),
      ),
      child: child,
    );
  }
}
