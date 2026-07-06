import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:Greenly/shared/widgets/skeleton/app_skeleton_box.dart';
import 'package:Greenly/shared/widgets/skeleton/app_skeleton_card.dart';
import 'package:Greenly/shared/widgets/skeleton/app_skeleton_line.dart';
import 'package:flutter/material.dart';

class OrderListSkeleton extends StatelessWidget {
  final int itemCount;

  const OrderListSkeleton({super.key, this.itemCount = 6});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(UIConstants.paddingM),
      itemCount: itemCount,
      separatorBuilder: (context, index) =>
          const SizedBox(height: UIConstants.spacingS),
      itemBuilder: (context, index) => const _OrderCardSkeleton(),
    );
  }
}

class OrderCardSkeleton extends StatelessWidget {
  const OrderCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return const _OrderCardSkeleton();
  }
}

class OrderDetailSkeleton extends StatelessWidget {
  const OrderDetailSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(UIConstants.paddingM),
      children: const [
        _StatusSkeleton(),
        SizedBox(height: UIConstants.spacingS),
        _ItemsSkeleton(),
        SizedBox(height: UIConstants.spacingS),
        _PaymentSkeleton(),
      ],
    );
  }
}

class _OrderCardSkeleton extends StatelessWidget {
  const _OrderCardSkeleton();

  @override
  Widget build(BuildContext context) {
    return AppSkeletonCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Row(
            children: [
              AppSkeletonBox(width: 16, height: 16, radius: 5),
              SizedBox(width: UIConstants.spacingXS),
              Expanded(child: AppSkeletonLine(height: 13)),
              SizedBox(width: UIConstants.spacingS),
              AppSkeletonBox(width: 74, height: 24, radius: 999),
            ],
          ),
          Divider(height: UIConstants.spacingL),
          AppSkeletonLine(width: 220, height: 13),
          SizedBox(height: UIConstants.spacingS),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              AppSkeletonLine(width: 86, height: 11),
              AppSkeletonLine(width: 110, height: 15),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatusSkeleton extends StatelessWidget {
  const _StatusSkeleton();

  @override
  Widget build(BuildContext context) {
    return AppSkeletonCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Row(
            children: [
              Expanded(child: AppSkeletonLine(height: 14)),
              SizedBox(width: UIConstants.spacingS),
              AppSkeletonBox(width: 76, height: 24, radius: 999),
            ],
          ),
          SizedBox(height: UIConstants.spacingS),
          AppSkeletonLine(width: 144, height: 11),
          Divider(height: UIConstants.spacingL),
          Row(
            children: [
              AppSkeletonBox(width: 16, height: 16, radius: 5),
              SizedBox(width: UIConstants.spacingXS),
              AppSkeletonLine(width: 138, height: 13),
            ],
          ),
        ],
      ),
    );
  }
}

class _ItemsSkeleton extends StatelessWidget {
  const _ItemsSkeleton();

  @override
  Widget build(BuildContext context) {
    return AppSkeletonCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          AppSkeletonLine(width: 72, height: 16),
          SizedBox(height: UIConstants.spacingS),
          _OrderItemSkeleton(),
          _OrderItemSkeleton(),
          _OrderItemSkeleton(),
          Divider(height: UIConstants.spacingL),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              AppSkeletonLine(width: 48, height: 16),
              AppSkeletonLine(width: 118, height: 18),
            ],
          ),
        ],
      ),
    );
  }
}

class _OrderItemSkeleton extends StatelessWidget {
  const _OrderItemSkeleton();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: const [
          AppSkeletonBox(width: 40, height: 40, radius: UIConstants.radiusM),
          SizedBox(width: UIConstants.spacingS),
          Expanded(child: AppSkeletonLine(height: 13)),
          SizedBox(width: UIConstants.spacingS),
          AppSkeletonLine(width: 72, height: 13),
        ],
      ),
    );
  }
}

class _PaymentSkeleton extends StatelessWidget {
  const _PaymentSkeleton();

  @override
  Widget build(BuildContext context) {
    return AppSkeletonCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          AppSkeletonLine(width: 98, height: 16),
          SizedBox(height: UIConstants.spacingM),
          AppSkeletonLine(height: 12),
          SizedBox(height: UIConstants.spacingS),
          AppSkeletonLine(height: 12),
          SizedBox(height: UIConstants.spacingS),
          AppSkeletonBox(height: 44, radius: UIConstants.radiusM),
        ],
      ),
    );
  }
}
