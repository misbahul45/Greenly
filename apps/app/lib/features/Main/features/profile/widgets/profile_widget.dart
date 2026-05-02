import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:flutter/material.dart';

class ProfileWidget extends StatelessWidget {
  const ProfileWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(UIConstants.paddingL),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(UIConstants.radiusL),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primaryColor.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 32,
            backgroundImage: NetworkImage(
              'https://i.pravatar.cc/150?img=3',
            ),
          ),
          const SizedBox(width: UIConstants.spacingL),

          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'John Doe',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: UIConstants.spacingXS),
              Text(
                'john.doe@example.com',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey,
                    ),
              ),
              const SizedBox(height: UIConstants.spacingS),

              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: AppTheme.tertiaryColor.withOpacity(0.3),
                  borderRadius:
                      BorderRadius.circular(UIConstants.radiusXL),
                ),
                child: const Text(
                  "MEMBER",
                  style: TextStyle(
                    fontSize: UIConstants.fontSizeXS,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }
}