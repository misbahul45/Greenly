import 'package:flutter/material.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/onboarding/presentation/widgets/eco_badge.dart';

class IllustrationEco extends StatelessWidget {
  const IllustrationEco({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 220,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.tertiaryColor.withOpacity(0.25),
            ),
          ),
          Container(
            width: 140,
            height: 140,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.tertiaryColor.withOpacity(0.4),
            ),
          ),
          Container(
            width: 88,
            height: 88,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.primaryColor,
            ),
            child: const Icon(Icons.eco_rounded, color: Colors.white, size: 46),
          ),
          const Positioned(
            top: 20,
            right: 10,
            child: EcoBadge(
              label: '🌿 Eco Score',
              color: AppTheme.primaryColor,
            ),
          ),
          const Positioned(
            bottom: 30,
            right: 0,
            child: EcoBadge(label: '♻ Recyclable', color: Color(0xFF388E3C)),
          ),
          const Positioned(
            bottom: 24,
            left: 4,
            child: EcoBadge(label: 'CO₂ Low', color: Color(0xFF1B5E20)),
          ),
        ],
      ),
    );
  }
}
