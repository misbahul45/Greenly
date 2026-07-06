import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:Greenly/shared/widgets/skeleton/app_skeleton_box.dart';
import 'package:Greenly/shared/widgets/skeleton/app_skeleton_card.dart';
import 'package:Greenly/shared/widgets/skeleton/app_skeleton_line.dart';
import 'package:flutter/material.dart';

class CartSkeleton extends StatelessWidget {
  const CartSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(UIConstants.paddingM),
      itemCount: 3,
      separatorBuilder: (context, index) =>
          const SizedBox(height: UIConstants.spacingM),
      itemBuilder: (context, index) => const _CartGroupSkeleton(),
    );
  }
}

class _CartGroupSkeleton extends StatelessWidget {
  const _CartGroupSkeleton();

  @override
  Widget build(BuildContext context) {
    return AppSkeletonCard(
      child: Column(
        children: const [
          Row(
            children: [
              AppSkeletonBox(width: 18, height: 18, radius: 5),
              SizedBox(width: UIConstants.spacingS),
              AppSkeletonLine(width: 136, height: 14),
            ],
          ),
          Divider(height: UIConstants.spacingL),
          _CartItemSkeleton(),
          SizedBox(height: UIConstants.spacingS),
          _CartItemSkeleton(),
          Divider(height: UIConstants.spacingL),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppSkeletonLine(width: 92, height: 11),
                    SizedBox(height: UIConstants.spacingXS),
                    AppSkeletonLine(width: 120, height: 15),
                  ],
                ),
              ),
              AppSkeletonBox(
                width: 92,
                height: 42,
                radius: UIConstants.radiusM,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CartItemSkeleton extends StatelessWidget {
  const _CartItemSkeleton();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: const [
        AppSkeletonBox(width: 64, height: 64, radius: UIConstants.radiusM),
        SizedBox(width: UIConstants.spacingM),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AppSkeletonLine(height: 13),
              SizedBox(height: UIConstants.spacingS),
              AppSkeletonLine(width: 96, height: 13),
              SizedBox(height: UIConstants.spacingS),
              AppSkeletonBox(
                width: 92,
                height: 28,
                radius: UIConstants.radiusS,
              ),
            ],
          ),
        ),
        SizedBox(width: UIConstants.spacingS),
        AppSkeletonBox(width: 20, height: 20, radius: 5),
      ],
    );
  }
}
