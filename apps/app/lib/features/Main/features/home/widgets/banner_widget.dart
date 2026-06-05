import 'dart:async';

import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/Main/features/home/bloc/home_bloc.dart';
import 'package:app/features/Main/features/home/bloc/home_state.dart';
import 'package:app/features/Main/features/home/widgets/skeleton/banner_skeleton.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class BannerWidget extends StatefulWidget {
  const BannerWidget({super.key});

  @override
  State<BannerWidget> createState() => _BannerWidgetState();
}

class _BannerWidgetState extends State<BannerWidget> {
  late final PageController _controller;

  Timer? _timer;

  int _currentPage = 0;
  int _lastItemCount = 0;

  static const int _multiplier = 1000;

  @override
  void initState() {
    super.initState();
    _controller = PageController(viewportFraction: 0.9);
  }

  void _setupCarousel(int itemCount) {
    if (!mounted || itemCount <= 0) return;

    if (_lastItemCount == itemCount && _timer != null) return;

    _lastItemCount = itemCount;
    _timer?.cancel();

    final initialPage = itemCount * (_multiplier ~/ 2);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || !_controller.hasClients) return;

      final currentPage = _controller.page?.round() ?? 0;

      if (currentPage == 0 && itemCount > 1) {
        _controller.jumpToPage(initialPage);
      }

      if (itemCount > 1) {
        _startAutoScroll();
      }
    });
  }

  void _startAutoScroll() {
    _timer?.cancel();

    _timer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (!mounted || !_controller.hasClients) return;

      final current = _controller.page?.round() ?? _controller.initialPage;
      _animateToPage(current + 1);
    });
  }

  void _animateToPage(int page) {
    if (!_controller.hasClients) return;

    _controller.animateToPage(
      page,
      duration: const Duration(milliseconds: 420),
      curve: Curves.easeOutCubic,
    );
  }

  void _goNext() {
    final current = _controller.page?.round() ?? _controller.initialPage;
    _animateToPage(current + 1);
    _restartAutoScrollAfterManualAction();
  }

  void _goPrev() {
    final current = _controller.page?.round() ?? _controller.initialPage;
    _animateToPage(current - 1);
    _restartAutoScrollAfterManualAction();
  }

  void _restartAutoScrollAfterManualAction() {
    if (_lastItemCount <= 1) return;
    _startAutoScroll();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<HomeBloc, HomeState>(
      buildWhen: (prev, curr) => prev.banner != curr.banner,
      builder: (context, state) {
        final bannerState = state.banner;

        if (bannerState.isLoading) {
          return const BannerSkeleton();
        }

        final items = bannerState.data;

        if (items.isEmpty) {
          _timer?.cancel();
          _lastItemCount = 0;
          return const SizedBox.shrink();
        }

        final itemCount = items.length;
        final virtualCount = itemCount == 1 ? 1 : itemCount * _multiplier;

        _setupCarousel(itemCount);

        return LayoutBuilder(
          builder: (context, constraints) {
            final width = constraints.maxWidth;

            final isTiny = width < 340;
            final isMobile = width < 600;
            final isTablet = width >= 600 && width < 900;

            final height = isTiny
                ? 158.0
                : isMobile
                    ? 178.0
                    : isTablet
                        ? 220.0
                        : 260.0;

            final horizontalMargin = isMobile ? 7.0 : 10.0;
            final borderRadius = isMobile ? 18.0 : 24.0;
            final showArrows = itemCount > 1 && width >= 390;

            return SizedBox(
              height: height + 18,
              width: double.infinity,
              child: Stack(
                clipBehavior: Clip.none,
                alignment: Alignment.center,
                children: [
                  Positioned.fill(
                    top: 4,
                    bottom: 14,
                    child: PageView.builder(
                      controller: _controller,
                      physics: itemCount > 1
                          ? const PageScrollPhysics()
                          : const NeverScrollableScrollPhysics(),
                      itemCount: virtualCount,
                      onPageChanged: (index) {
                        if (!mounted) return;

                        setState(() {
                          _currentPage = index % itemCount;
                        });
                      },
                      itemBuilder: (context, index) {
                        final item = items[index % itemCount];

                        return AnimatedBuilder(
                          animation: _controller,
                          builder: (context, child) {
                            double scale = 1;
                            double translateY = 0;

                            if (_controller.hasClients && _controller.position.haveDimensions) {
                              final page = _controller.page ?? _controller.initialPage.toDouble();
                              final distance = (page - index).abs();

                              scale = (1 - (distance * 0.055)).clamp(0.92, 1.0).toDouble();

                              translateY = (distance * 8).clamp(0.0, 8.0).toDouble();
                            }

                            return Transform.translate(
                              offset: Offset(0, translateY),
                              child: Transform.scale(
                                scale: scale,
                                child: child,
                              ),
                            );
                          },
                          child: _FloatingBannerCard(
                            imageUrl: item.imageUrl,
                            title: item.title,
                            description: item.description,
                            isMobile: isMobile,
                            horizontalMargin: horizontalMargin,
                            borderRadius: borderRadius,
                          ),
                        );
                      },
                    ),
                  ),
                  if (showArrows) ...[
                    Positioned(
                      left: 4,
                      child: _BannerArrowButton(
                        icon: Icons.chevron_left_rounded,
                        onTap: _goPrev,
                      ),
                    ),
                    Positioned(
                      right: 4,
                      child: _BannerArrowButton(
                        icon: Icons.chevron_right_rounded,
                        onTap: _goNext,
                      ),
                    ),
                  ],
                  if (itemCount > 1)
                    Positioned(
                      bottom: 4,
                      child: _BannerIndicator(
                        itemCount: itemCount,
                        currentPage: _currentPage,
                      ),
                    ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

class _FloatingBannerCard extends StatelessWidget {
  const _FloatingBannerCard({
    required this.imageUrl,
    required this.title,
    required this.description,
    required this.isMobile,
    required this.horizontalMargin,
    required this.borderRadius,
  });

  final String imageUrl;
  final String title;
  final String description;
  final bool isMobile;
  final double horizontalMargin;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: horizontalMargin),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(borderRadius),
        color: AppTheme.primaryColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 22,
            spreadRadius: -4,
            offset: const Offset(0, 14),
          ),
          BoxShadow(
            color: AppTheme.primaryColor.withValues(alpha: 0.16),
            blurRadius: 26,
            spreadRadius: -10,
            offset: const Offset(0, 18),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.network(
              imageUrl,
              fit: BoxFit.cover,
              loadingBuilder: (context, child, loadingProgress) {
                if (loadingProgress == null) return child;

                return Container(
                  color: AppTheme.primaryColor.withValues(alpha: 0.08),
                  child: const Center(
                    child: SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  ),
                );
              },
              errorBuilder: (_, _, _) {
                return Container(
                  color: AppTheme.tertiaryColor,
                  child: const Center(
                    child: Icon(
                      Icons.image_not_supported_outlined,
                      color: Colors.white,
                      size: 34,
                    ),
                  ),
                );
              },
            ),
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [
                    Colors.black.withValues(alpha: 0.72),
                    Colors.black.withValues(alpha: 0.22),
                    Colors.transparent,
                  ],
                  stops: const [0, 0.52, 1],
                ),
              ),
            ),
            Positioned(
              left: isMobile ? 14 : 20,
              right: isMobile ? 14 : 20,
              bottom: isMobile ? 28 : 34,
              child: _BannerTextContent(
                title: title,
                description: description,
                isMobile: isMobile,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BannerTextContent extends StatelessWidget {
  const _BannerTextContent({
    required this.title,
    required this.description,
    required this.isMobile,
  });

  final String title;
  final String description;
  final bool isMobile;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            maxLines: isMobile ? 1 : 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: Colors.white,
              fontSize: isMobile ? 14 : 17,
              height: 1.15,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.1,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            description,
            maxLines: isMobile ? 2 : 3,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.82),
              fontSize: isMobile ? 11.5 : 13,
              height: 1.35,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _BannerArrowButton extends StatelessWidget {
  const _BannerArrowButton({
    required this.icon,
    required this.onTap,
  });

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      shape: const CircleBorder(),
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: Container(
          width: 34,
          height: 34,
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.32),
            shape: BoxShape.circle,
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.28),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.18),
                blurRadius: 14,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Icon(
            icon,
            color: Colors.white,
            size: 24,
          ),
        ),
      ),
    );
  }
}

class _BannerIndicator extends StatelessWidget {
  const _BannerIndicator({
    required this.itemCount,
    required this.currentPage,
  });

  final int itemCount;
  final int currentPage;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 8,
        vertical: 5,
      ),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.24),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.16),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(itemCount, (index) {
          final isActive = index == currentPage;

          return AnimatedContainer(
            duration: const Duration(milliseconds: 280),
            curve: Curves.easeOutCubic,
            margin: const EdgeInsets.symmetric(horizontal: 3),
            width: isActive ? 18 : 6,
            height: 6,
            decoration: BoxDecoration(
              color: isActive
                  ? Colors.white
                  : Colors.white.withValues(alpha: 0.45),
              borderRadius: BorderRadius.circular(99),
            ),
          );
        }),
      ),
    );
  }
}