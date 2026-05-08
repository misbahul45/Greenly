import 'package:flutter/material.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/onboarding/presentation/widgets/dot_indicator_widget.dart';
import 'package:app/features/onboarding/presentation/widgets/illustration_eco.dart';
import 'package:app/features/onboarding/presentation/widgets/illustration_product.dart';
import 'package:app/features/onboarding/presentation/widgets/illustration_score.dart';

class WelcomeCarouselScreen extends StatefulWidget {
  final VoidCallback onNext;

  const WelcomeCarouselScreen({super.key, required this.onNext});

  @override
  State<WelcomeCarouselScreen> createState() => _WelcomeCarouselScreenState();
}

class _WelcomeCarouselScreenState extends State<WelcomeCarouselScreen> {
  final PageController _pageCtrl = PageController();
  int _current = 0;

  final _slides = const [
    _SlideData(
      heading: 'Belanja untuk Bumi',
      sub:
          'Setiap produk memiliki eco-score, carbon footprint, dan label recyclable agar kamu bisa memilih dengan penuh kesadaran.',
      illustrationType: 0,
    ),
    _SlideData(
      heading: 'Produk Terverifikasi',
      sub:
          'Ribuan produk eco-friendly dari toko terpercaya, dengan ulasan nyata, rating akurat, dan garansi kualitas.',
      illustrationType: 1,
    ),
    _SlideData(
      heading: 'Jejak Hijaumu Dimulai',
      sub:
          'Pantau dampak belanjamu terhadap lingkungan dan raih badge Eco Champion setiap bulannya.',
      illustrationType: 2,
    ),
  ];

  void _goNext() {
    if (_current < 2) {
      _pageCtrl.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    } else {
      widget.onNext();
    }
  }

  @override
  void dispose() {
    _pageCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.topRight,
              child: Padding(
                padding: const EdgeInsets.only(top: 12, right: 16),
                child: TextButton(
                  onPressed: widget.onNext,
                  child: Text(
                    'Lewati',
                    style: TextStyle(color: Colors.grey[500], fontSize: 14),
                  ),
                ),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _pageCtrl,
                physics: const BouncingScrollPhysics(),
                onPageChanged: (i) => setState(() => _current = i),
                itemCount: _slides.length,
                itemBuilder: (_, i) => _SlidePage(data: _slides[i]),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
              child: Column(
                children: [
                  DotIndicatorWidget(
                    count: 3,
                    current: _current,
                    activeColor: AppTheme.primaryColor,
                    inactiveColor: const Color(0xFFD8D8D8),
                  ),
                  const SizedBox(height: 28),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _goNext,
                      child: Text(
                        _current == 2 ? 'Mulai Sekarang' : 'Selanjutnya',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SlideData {
  final String heading;
  final String sub;
  final int illustrationType;

  const _SlideData({
    required this.heading,
    required this.sub,
    required this.illustrationType,
  });
}

class _SlidePage extends StatelessWidget {
  final _SlideData data;

  const _SlidePage({required this.data});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildIllustration(data.illustrationType),
          const SizedBox(height: 40),
          Text(
            data.heading,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w800,
              color: Colors.black87,
              height: 1.2,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            data.sub,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIllustration(int type) {
    if (type == 0) return const IllustrationEco();
    if (type == 1) return const IllustrationProduct();
    return const IllustrationScore();
  }
}
