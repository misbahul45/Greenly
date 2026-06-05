import 'package:app/core/constants/ui_constants.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_box.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_card.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_circle.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_line.dart';
import 'package:flutter/material.dart';

class ChatSkeleton extends StatelessWidget {
  final bool showProductContext;

  const ChatSkeleton({super.key, this.showProductContext = false});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          color: Colors.white,
          padding: const EdgeInsets.all(UIConstants.paddingM),
          child: Row(
            children: const [
              AppSkeletonCircle(size: 36),
              SizedBox(width: UIConstants.spacingS),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppSkeletonLine(width: 140, height: 14),
                    SizedBox(height: UIConstants.spacingXS),
                    AppSkeletonLine(width: 44, height: 10),
                  ],
                ),
              ),
            ],
          ),
        ),
        if (showProductContext) const _ProductContextSkeleton(),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(UIConstants.paddingM),
            children: const [
              _BubbleSkeleton(widthFactor: 0.62, alignRight: false),
              _BubbleSkeleton(widthFactor: 0.48, alignRight: true),
              _BubbleSkeleton(widthFactor: 0.72, alignRight: false),
              _BubbleSkeleton(widthFactor: 0.54, alignRight: true),
              _BubbleSkeleton(widthFactor: 0.66, alignRight: false),
              _BubbleSkeleton(widthFactor: 0.42, alignRight: true),
            ],
          ),
        ),
        Container(
          color: Colors.white,
          padding: const EdgeInsets.fromLTRB(
            UIConstants.paddingM,
            UIConstants.spacingS,
            UIConstants.paddingM,
            UIConstants.spacingM,
          ),
          child: Row(
            children: const [
              Expanded(
                child: AppSkeletonBox(height: 46, radius: UIConstants.radiusM),
              ),
              SizedBox(width: UIConstants.spacingS),
              AppSkeletonCircle(size: 46),
            ],
          ),
        ),
      ],
    );
  }
}

class ChatListSkeleton extends StatelessWidget {
  final int itemCount;

  const ChatListSkeleton({super.key, this.itemCount = 6});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(UIConstants.paddingM),
      itemCount: itemCount,
      separatorBuilder: (context, index) =>
          const SizedBox(height: UIConstants.spacingS),
      itemBuilder: (context, index) => const _ChatTileSkeleton(),
    );
  }
}

class _ChatTileSkeleton extends StatelessWidget {
  const _ChatTileSkeleton();

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
                AppSkeletonLine(width: 132, height: 14),
                SizedBox(height: UIConstants.spacingS),
                AppSkeletonLine(width: 210, height: 11),
              ],
            ),
          ),
          SizedBox(width: UIConstants.spacingS),
          AppSkeletonBox(width: 18, height: 18, radius: 5),
        ],
      ),
    );
  }
}

class _ProductContextSkeleton extends StatelessWidget {
  const _ProductContextSkeleton();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(UIConstants.paddingM),
      child: Row(
        children: const [
          AppSkeletonBox(width: 56, height: 56, radius: UIConstants.radiusS),
          SizedBox(width: UIConstants.spacingM),
          Expanded(child: AppSkeletonLine(height: 14)),
          SizedBox(width: UIConstants.spacingS),
          AppSkeletonBox(width: 92, height: 36, radius: UIConstants.radiusM),
        ],
      ),
    );
  }
}

class _BubbleSkeleton extends StatelessWidget {
  final double widthFactor;
  final bool alignRight;

  const _BubbleSkeleton({required this.widthFactor, required this.alignRight});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: alignRight ? Alignment.centerRight : Alignment.centerLeft,
      child: FractionallySizedBox(
        widthFactor: widthFactor,
        child: const AppSkeletonBox(
          height: 42,
          radius: UIConstants.radiusM,
          margin: EdgeInsets.only(bottom: UIConstants.spacingM),
        ),
      ),
    );
  }
}
