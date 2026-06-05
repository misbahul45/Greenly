import 'package:app/core/constants/ui_constants.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_box.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_card.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_line.dart';
import 'package:flutter/material.dart';

class StatCardSkeleton extends StatelessWidget {
  const StatCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return const AppSkeletonCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppSkeletonBox(width: 40, height: 40, radius: UIConstants.radiusM),
          SizedBox(height: UIConstants.spacingM),
          AppSkeletonLine(width: 72, height: 16),
          SizedBox(height: 4),
          AppSkeletonLine(width: 54, height: 10),
        ],
      ),
    );
  }
}
