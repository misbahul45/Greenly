import 'package:app/core/constants/ui_constants.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_box.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_card.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_circle.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_line.dart';
import 'package:flutter/material.dart';

class ProfileSkeleton extends StatelessWidget {
  const ProfileSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(UIConstants.paddingM),
      children: const [
        _ProfileHeaderSkeleton(),
        SizedBox(height: UIConstants.spacingXL),
        _WideCardSkeleton(),
        SizedBox(height: UIConstants.spacingXL),
        _StatsSkeleton(),
        SizedBox(height: UIConstants.spacingXL),
        _ActionCardSkeleton(titleWidth: 118),
        SizedBox(height: UIConstants.spacingXL),
        _ActionCardSkeleton(titleWidth: 136),
        SizedBox(height: UIConstants.spacingXL),
        _ActionCardSkeleton(titleWidth: 96),
      ],
    );
  }
}

class EditProfileSkeleton extends StatelessWidget {
  const EditProfileSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(UIConstants.paddingL),
      children: const [
        Center(child: AppSkeletonCircle(size: 96)),
        SizedBox(height: UIConstants.spacingXXL),
        AppSkeletonLine(width: 108, height: 13),
        SizedBox(height: UIConstants.spacingXS),
        AppSkeletonBox(height: 52, radius: UIConstants.radiusM),
        SizedBox(height: UIConstants.spacingL),
        AppSkeletonLine(width: 72, height: 13),
        SizedBox(height: UIConstants.spacingXS),
        AppSkeletonBox(height: 52, radius: UIConstants.radiusM),
        SizedBox(height: UIConstants.spacingL),
        AppSkeletonLine(width: 150, height: 13),
        SizedBox(height: UIConstants.spacingXS),
        AppSkeletonBox(height: 52, radius: UIConstants.radiusM),
        SizedBox(height: UIConstants.spacingL),
        AppSkeletonBox(height: 92, radius: UIConstants.radiusM),
        SizedBox(height: UIConstants.spacingL),
        AppSkeletonBox(height: 52, radius: UIConstants.radiusM),
        SizedBox(height: UIConstants.spacingL),
        AppSkeletonBox(height: 52, radius: UIConstants.radiusM),
        SizedBox(height: UIConstants.spacingXXXL),
        AppSkeletonBox(
          height: UIConstants.buttonHeight,
          radius: UIConstants.radiusM,
        ),
      ],
    );
  }
}

class _ProfileHeaderSkeleton extends StatelessWidget {
  const _ProfileHeaderSkeleton();

  @override
  Widget build(BuildContext context) {
    return AppSkeletonCard(
      padding: const EdgeInsets.all(UIConstants.paddingL),
      child: Row(
        children: const [
          AppSkeletonCircle(size: 64),
          SizedBox(width: UIConstants.spacingL),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppSkeletonLine(width: 150, height: 16),
                SizedBox(height: UIConstants.spacingS),
                AppSkeletonLine(width: 210, height: 12),
                SizedBox(height: UIConstants.spacingS),
                AppSkeletonBox(width: 78, height: 24, radius: 999),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatsSkeleton extends StatelessWidget {
  const _StatsSkeleton();

  @override
  Widget build(BuildContext context) {
    return AppSkeletonCard(
      child: Row(
        children: List.generate(
          4,
          (index) => const Expanded(
            child: Column(
              children: [
                AppSkeletonCircle(size: 24),
                SizedBox(height: UIConstants.spacingXS),
                AppSkeletonLine(width: 32, height: 16),
                SizedBox(height: UIConstants.spacingXS),
                AppSkeletonLine(width: 54, height: 10),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _WideCardSkeleton extends StatelessWidget {
  const _WideCardSkeleton();

  @override
  Widget build(BuildContext context) {
    return const AppSkeletonBox(height: 82, radius: UIConstants.radiusL);
  }
}

class _ActionCardSkeleton extends StatelessWidget {
  final double titleWidth;

  const _ActionCardSkeleton({required this.titleWidth});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AppSkeletonLine(width: titleWidth, height: 15),
        const SizedBox(height: UIConstants.spacingS),
        AppSkeletonCard(
          child: Column(
            children: const [
              _ActionRowSkeleton(),
              Divider(height: UIConstants.spacingL),
              _ActionRowSkeleton(),
            ],
          ),
        ),
      ],
    );
  }
}

class _ActionRowSkeleton extends StatelessWidget {
  const _ActionRowSkeleton();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: const [
        AppSkeletonBox(width: 40, height: 40, radius: UIConstants.radiusS),
        SizedBox(width: UIConstants.spacingM),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AppSkeletonLine(width: 126, height: 13),
              SizedBox(height: UIConstants.spacingS),
              AppSkeletonLine(width: 188, height: 10),
            ],
          ),
        ),
        AppSkeletonBox(width: 18, height: 18, radius: 5),
      ],
    );
  }
}
