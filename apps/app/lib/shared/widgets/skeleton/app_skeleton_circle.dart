import 'package:app/shared/widgets/skeleton/app_skeleton_box.dart';
import 'package:flutter/material.dart';

class AppSkeletonCircle extends StatelessWidget {
  final double size;
  final EdgeInsetsGeometry? margin;

  const AppSkeletonCircle({super.key, required this.size, this.margin});

  @override
  Widget build(BuildContext context) {
    return AppSkeletonBox(
      width: size,
      height: size,
      shape: BoxShape.circle,
      margin: margin,
    );
  }
}
