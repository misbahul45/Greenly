import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:flutter/material.dart';

class SemanticReasonChip extends StatelessWidget {
  final String reason;

  const SemanticReasonChip({super.key, required this.reason});

  @override
  Widget build(BuildContext context) {
    if (reason.isEmpty) return const SizedBox.shrink();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F8E9),
        borderRadius: BorderRadius.circular(UIConstants.radiusS),
      ),
      child: Text(
        reason,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(
          fontSize: UIConstants.fontSizeXS,
          color: Color(0xFF388E3C),
        ),
      ),
    );
  }
}
