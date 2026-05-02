import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/shared/widgets/section_title.dart';
import 'package:flutter/material.dart';

class MyActivitiesWidget extends StatelessWidget {
  const MyActivitiesWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      _ActivityItem(
        icon: Icons.store_outlined,
        title: 'Toko Diikuti',
        subtitle: 'Lihat toko yang kamu ikuti',
        onTap: () {
          Navigator.pushNamed(context, AppRoutes.shopFollowers);
        },
      ),
      _ActivityItem(
        icon: Icons.star_outline_rounded,
        title: 'Ulasan Saya',
        subtitle: 'Lihat semua ulasan produkmu',
        onTap: () {
          Navigator.pushNamed(context, AppRoutes.reviews);
        },
      ),
    ];

    return Column(
      children: [
        const SectionTitle(title: 'Aktivitas Saya'),
        const SizedBox(height: UIConstants.spacingS),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(UIConstants.radiusL),
          ),
          child: Column(
            children: items.map((item) {
              return Column(
                children: [
                  ListTile(
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: UIConstants.paddingM,
                      vertical: UIConstants.spacingS,
                    ),
                    leading: Container(
                      padding: const EdgeInsets.all(UIConstants.paddingS),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF5F5F5),
                        borderRadius:
                            BorderRadius.circular(UIConstants.radiusS),
                      ),
                      child: Icon(
                        item.icon,
                        size: UIConstants.iconSizeL,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                    title: Text(
                      item.title,
                      style: const TextStyle(
                        fontSize: UIConstants.fontSizeL,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1A1A2E),
                      ),
                    ),
                    subtitle: Text(
                      item.subtitle,
                      style: const TextStyle(
                        fontSize: UIConstants.fontSizeXS,
                        color: Colors.grey,
                      ),
                    ),
                    trailing: const Icon(
                      Icons.chevron_right,
                      color: Colors.grey,
                    ),
                    onTap: item.onTap,
                  ),
                  const Divider(height: 1, thickness: 1, color: Color(0xFFF0F0F0)),
                ],
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _ActivityItem {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ActivityItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });
}