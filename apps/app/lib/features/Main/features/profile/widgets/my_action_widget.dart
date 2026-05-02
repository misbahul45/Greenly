import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/router/auth_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/shared/widgets/section_title.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:app/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:app/features/auth/presentation/bloc/auth_event.dart';
import 'package:app/features/auth/presentation/bloc/auth_state.dart';

class MyActionWidget extends StatelessWidget {
  const MyActionWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      _ActionItem(
        icon: Icons.edit_outlined,
        title: 'Edit Profile',
        subtitle: 'Ubah informasi akunmu',
        onTap: () => Navigator.pushNamed(context, AppRoutes.editProfile),
      ),
      _ActionItem(
        icon: Icons.logout,
        title: 'Logout',
        subtitle: 'Keluar dari akun',
        onTap: () => _showLogoutDialog(context),
        isDanger: true,
      ),
    ];

    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthLoading) {
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (_) => const PopScope(
              canPop: false,
              child: ColoredBox(
                color: Colors.transparent,
                child: Center(
                  child: CircularProgressIndicator(
                    color: AppTheme.primaryColor,
                  ),
                ),
              ),
            ),
          );
        }

        if (state is AuthUnauthenticated) {
          Navigator.pushNamedAndRemoveUntil(
            context,
            AuthRoutes.login,
            (route) => false,
          );
        }

        if (state is AuthError) {
          if (Navigator.canPop(context)) Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.message)),
          );
        }
      },
      child: Column(
        children: [
          const SectionTitle(title: 'Pengaturan'),
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
                          borderRadius: BorderRadius.circular(UIConstants.radiusS),
                        ),
                        child: Icon(
                          item.icon,
                          size: UIConstants.iconSizeL,
                          color: item.isDanger ? Colors.red : AppTheme.primaryColor,
                        ),
                      ),
                      title: Text(
                        item.title,
                        style: TextStyle(
                          fontSize: UIConstants.fontSizeL,
                          fontWeight: FontWeight.w600,
                          color: item.isDanger ? Colors.red : const Color(0xFF1A1A2E),
                        ),
                      ),
                      subtitle: Text(
                        item.subtitle,
                        style: const TextStyle(
                          fontSize: UIConstants.fontSizeXS,
                          color: Colors.grey,
                        ),
                      ),
                      trailing: const Icon(Icons.chevron_right, color: Colors.grey),
                      onTap: item.onTap,
                    ),
                    const Divider(
                      height: 1,
                      thickness: 1,
                      color: Color(0xFFF0F0F0),
                    ),
                  ],
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Apakah kamu yakin ingin keluar?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              context.read<AuthBloc>().add(AuthLogoutRequested());
            },
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }
}

class _ActionItem {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final bool isDanger;

  const _ActionItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.isDanger = false,
  });
}