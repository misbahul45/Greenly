import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:Greenly/shared/widgets/skeleton/app_skeleton_box.dart';
import 'package:Greenly/shared/widgets/skeleton/app_skeleton_card.dart';
import 'package:Greenly/shared/widgets/skeleton/app_skeleton_circle.dart';
import 'package:Greenly/shared/widgets/skeleton/app_skeleton_line.dart';
import 'package:flutter/material.dart';

class ShopDetailSkeleton extends StatelessWidget {
  const ShopDetailSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      physics: const NeverScrollableScrollPhysics(),
      slivers: [
        SliverToBoxAdapter(
          child: Container(
            color: Colors.white,
            padding: const EdgeInsets.all(UIConstants.paddingL),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: const [
                    AppSkeletonCircle(size: 64),
                    SizedBox(width: UIConstants.spacingL),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          AppSkeletonLine(width: 170, height: 18),
                          SizedBox(height: UIConstants.spacingS),
                          AppSkeletonLine(width: 92, height: 11),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: UIConstants.spacingM),
                const AppSkeletonLine(width: double.infinity, height: 12),
                const SizedBox(height: UIConstants.spacingXS),
                const AppSkeletonLine(width: 240, height: 12),
                const SizedBox(height: UIConstants.spacingL),
                Row(
                  children: const [
                    Expanded(
                      child: AppSkeletonBox(
                        height: 44,
                        radius: UIConstants.radiusM,
                      ),
                    ),
                    SizedBox(width: UIConstants.spacingM),
                    Expanded(
                      child: AppSkeletonBox(
                        height: 44,
                        radius: UIConstants.radiusM,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.fromLTRB(
              UIConstants.paddingM,
              UIConstants.spacingM,
              UIConstants.paddingM,
              UIConstants.spacingS,
            ),
            child: AppSkeletonLine(width: 110, height: 16),
          ),
        ),
        const SliverPadding(
          padding: EdgeInsets.all(UIConstants.paddingM),
          sliver: _ProductGridSkeleton(),
        ),
      ],
    );
  }
}

class ShopProductGridSkeleton extends StatelessWidget {
  final int itemCount;

  const ShopProductGridSkeleton({super.key, this.itemCount = 4});

  @override
  Widget build(BuildContext context) {
    return SliverPadding(
      padding: const EdgeInsets.all(UIConstants.paddingM),
      sliver: _ProductGridSkeleton(itemCount: itemCount),
    );
  }
}

class FollowingShopsSkeleton extends StatelessWidget {
  final int itemCount;

  const FollowingShopsSkeleton({super.key, this.itemCount = 6});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(UIConstants.paddingM),
      itemCount: itemCount,
      separatorBuilder: (context, index) =>
          const SizedBox(height: UIConstants.spacingS),
      itemBuilder: (context, index) => const _ShopTileSkeleton(),
    );
  }
}

class FollowingShopTileSkeleton extends StatelessWidget {
  const FollowingShopTileSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return const _ShopTileSkeleton();
  }
}

class _ProductGridSkeleton extends StatelessWidget {
  final int itemCount;

  const _ProductGridSkeleton({this.itemCount = 6});

  @override
  Widget build(BuildContext context) {
    return SliverGrid(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: UIConstants.spacingM,
        mainAxisSpacing: UIConstants.spacingM,
        childAspectRatio: 0.62,
      ),
      delegate: SliverChildBuilderDelegate(
        (context, index) => AppSkeletonCard(
          padding: EdgeInsets.zero,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              AspectRatio(
                aspectRatio: 1,
                child: AppSkeletonBox(radius: UIConstants.radiusL),
              ),
              Padding(
                padding: EdgeInsets.all(UIConstants.paddingM),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppSkeletonLine(height: 12),
                    SizedBox(height: UIConstants.spacingS),
                    AppSkeletonLine(width: 92, height: 12),
                    SizedBox(height: UIConstants.spacingM),
                    AppSkeletonLine(width: 72, height: 16),
                  ],
                ),
              ),
            ],
          ),
        ),
        childCount: itemCount,
      ),
    );
  }
}

class _ShopTileSkeleton extends StatelessWidget {
  const _ShopTileSkeleton();

  @override
  Widget build(BuildContext context) {
    return AppSkeletonCard(
      child: Row(
        children: const [
          AppSkeletonCircle(size: 48),
          SizedBox(width: UIConstants.spacingM),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppSkeletonLine(width: 150, height: 14),
                SizedBox(height: UIConstants.spacingS),
                AppSkeletonLine(width: 220, height: 11),
              ],
            ),
          ),
          AppSkeletonBox(width: 20, height: 20, radius: 6),
        ],
      ),
    );
  }
}
