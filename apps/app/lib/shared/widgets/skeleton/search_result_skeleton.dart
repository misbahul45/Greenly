import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:Greenly/shared/widgets/skeleton/app_skeleton_box.dart';
import 'package:Greenly/shared/widgets/skeleton/app_skeleton_card.dart';
import 'package:Greenly/shared/widgets/skeleton/app_skeleton_line.dart';
import 'package:flutter/material.dart';

class SearchResultSkeletonList extends StatelessWidget {
  final int itemCount;

  const SearchResultSkeletonList({super.key, this.itemCount = 6});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(UIConstants.paddingM),
      itemCount: itemCount,
      separatorBuilder: (context, index) =>
          const SizedBox(height: UIConstants.spacingM),
      itemBuilder: (context, index) => const SearchResultSkeletonCard(),
    );
  }
}

class SearchResultSkeletonCard extends StatelessWidget {
  const SearchResultSkeletonCard({super.key});

  @override
  Widget build(BuildContext context) {
    return AppSkeletonCard(
      radius: UIConstants.radiusM,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const AppSkeletonBox(
            width: 72,
            height: 72,
            radius: UIConstants.radiusS,
          ),
          const SizedBox(width: UIConstants.spacingM),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const AppSkeletonLine(width: double.infinity, height: 13),
                const SizedBox(height: UIConstants.spacingXS),
                const FractionallySizedBox(
                  widthFactor: 0.72,
                  child: AppSkeletonLine(height: 11),
                ),
                const SizedBox(height: UIConstants.spacingS),
                Row(
                  children: const [
                    AppSkeletonLine(width: 86, height: 14),
                    SizedBox(width: UIConstants.spacingS),
                    AppSkeletonBox(width: 48, height: 20, radius: 999),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
