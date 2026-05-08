import 'package:flutter/material.dart';
import 'package:app/core/theme/app_theme.dart';

class IllustrationScore extends StatelessWidget {
  const IllustrationScore({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 220,
      child: Center(
        child: Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 160,
              height: 160,
              child: CircularProgressIndicator(
                value: 0.88,
                strokeWidth: 12,
                backgroundColor: AppTheme.tertiaryColor.withOpacity(0.3),
                valueColor: const AlwaysStoppedAnimation<Color>(
                  AppTheme.primaryColor,
                ),
                strokeCap: StrokeCap.round,
              ),
            ),
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.eco_rounded,
                  color: AppTheme.primaryColor,
                  size: 32,
                ),
                const SizedBox(height: 4),
                const Text(
                  '8.8',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.primaryColor,
                  ),
                ),
                Text(
                  'Eco Score',
                  style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
