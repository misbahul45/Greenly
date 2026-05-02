import 'package:app/core/config/app_bar_config.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:flutter/material.dart';

class MainAppBar extends StatelessWidget implements PreferredSizeWidget {
  final int currentIndex;

  const MainAppBar({
    super.key,
    required this.currentIndex,
  });

  @override
  Size get preferredSize => const Size.fromHeight(64);

  @override
  Widget build(BuildContext context) {
    final config = mainAppBarConfigs[currentIndex];
    final theme = Theme.of(context);

    return AppBar(
      elevation: 0,
      automaticallyImplyLeading: false,
      titleSpacing: 16,
      title: config.showSearch
          ? _buildSearchBar(context, config, theme)
          : _buildTitle(context, config, theme),
    );
  }

  Widget _buildSearchBar(
    BuildContext context,
    AppBarConfig config,
    ThemeData theme,
  ) {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: () {
              Navigator.pushNamed(context, AppRoutes.searchProduct);
            },
            child: Container(
              height: 42,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: theme.inputDecorationTheme.fillColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.tertiaryColor),
              ),
              child: Row(
                children: [
                  Icon(Icons.search, size: 20, color: theme.hintColor),
                  const SizedBox(width: 10),
                  Text(
                    "Search product...",
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: Colors.grey,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        ..._buildActions(context, config),
      ],
    );
  }

  Widget _buildTitle(
    BuildContext context,
    AppBarConfig config,
    ThemeData theme,
  ) {
    return Row(
      children: [
        Expanded(
          child: Text(
            config.title,
            style: theme.textTheme.titleLarge?.copyWith(
              fontSize: 20,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        ..._buildActions(context, config),
      ],
    );
  }

  List<Widget> _buildActions(BuildContext context, AppBarConfig config) {
    return [
      if (config.showFavorite)
        IconButton(
          onPressed: () {
            Navigator.pushNamed(context, AppRoutes.favorites);
          },
          icon: const Icon(Icons.favorite_border_outlined),
          color: AppTheme.primaryColor,
        ),

      if (config.showCart)
        IconButton(
          onPressed: () {
            Navigator.pushNamed(context, AppRoutes.cart);
          },
          icon: const Icon(Icons.shopping_cart_outlined),
          color: AppTheme.primaryColor,
        ),
      if (config.showSetting)
        IconButton(
          onPressed: () {
            Navigator.pushNamed(context, AppRoutes.settings);
          },
          icon: const Icon(Icons.settings_outlined),
          color: AppTheme.primaryColor,
        ),
    ];
  }
}