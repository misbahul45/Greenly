import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:app/features/auth/presentation/bloc/auth_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProfileWidget extends StatelessWidget {
  const ProfileWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        final name = state is AuthAuthenticated ? state.user.name : '-';
        final email = state is AuthAuthenticated ? state.user.email : '-';
        final roles = state is AuthAuthenticated
            ? state.user.roles
            : <String>[];
        final isSeller =
            state is AuthAuthenticated && state.user.shops.isNotEmpty;
        final roleLabel = isSeller ? 'SELLER' : 'MEMBER';

        return Container(
          padding: const EdgeInsets.all(UIConstants.paddingL),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(UIConstants.radiusL),
            boxShadow: [
              BoxShadow(
                color: AppTheme.primaryColor.withValues(alpha: 0.08),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.tertiaryColor.withValues(alpha: 0.3),
                  border: Border.all(
                    color: AppTheme.primaryColor.withValues(alpha: 0.2),
                    width: 2,
                  ),
                ),
                child: const Icon(
                  Icons.person_rounded,
                  size: 34,
                  color: AppTheme.primaryColor,
                ),
              ),
              const SizedBox(width: UIConstants.spacingL),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name.isEmpty ? '-' : name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingXS),
                    Text(
                      email,
                      style: TextStyle(
                        fontSize: UIConstants.fontSizeM,
                        color: Colors.grey[500],
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingS),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: isSeller
                                ? AppTheme.primaryColor.withValues(alpha: 0.1)
                                : AppTheme.tertiaryColor.withValues(alpha: 0.3),
                            borderRadius: BorderRadius.circular(
                              UIConstants.radiusXL,
                            ),
                          ),
                          child: Text(
                            roleLabel,
                            style: TextStyle(
                              fontSize: UIConstants.fontSizeXS,
                              fontWeight: FontWeight.w600,
                              color: isSeller
                                  ? AppTheme.primaryColor
                                  : Colors.black54,
                            ),
                          ),
                        ),
                        if (roles.contains('ADMIN')) ...[
                          const SizedBox(width: UIConstants.spacingXS),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.orange.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(
                                UIConstants.radiusXL,
                              ),
                            ),
                            child: const Text(
                              'ADMIN',
                              style: TextStyle(
                                fontSize: UIConstants.fontSizeXS,
                                fontWeight: FontWeight.w600,
                                color: Colors.orange,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () {},
                icon: const Icon(
                  Icons.edit_outlined,
                  size: UIConstants.iconSizeL,
                  color: AppTheme.primaryColor,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
