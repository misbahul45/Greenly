import 'package:Greenly/shared/widgets/skeleton/app_skeleton_box.dart';
import 'package:flutter/material.dart';

class AppSkeletonLine extends StatelessWidget {
  final double? width;
  final double height;
  final double radius;
  final EdgeInsetsGeometry? margin;

  const AppSkeletonLine({
    super.key,
    this.width,
    this.height = 12,
    this.radius = 6,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    return AppSkeletonBox(
      width: width,
      height: height,
      radius: radius,
      margin: margin,
    );
  }
}
