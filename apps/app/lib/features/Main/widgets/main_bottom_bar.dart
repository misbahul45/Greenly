import 'package:flutter/material.dart';

class MainBottomBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const MainBottomBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  static const List<_NavItem> _items = [
    _NavItem(icon: Icons.home_outlined, activeIcon: Icons.home, label: 'Home'),
    _NavItem(icon: Icons.notifications_none, activeIcon: Icons.notifications, label: 'Notif'),
    _NavItem(icon: Icons.chat_bubble_outline, activeIcon: Icons.chat_bubble, label: 'Chat'),
    _NavItem(icon: Icons.favorite_border, activeIcon: Icons.favorite, label: 'Favorit'),
    _NavItem(icon: Icons.person_outline, activeIcon: Icons.person, label: 'Akun'),
  ];

  @override
  Widget build(BuildContext context) {
    return NavigationBar(
      selectedIndex: currentIndex,
      onDestinationSelected: onTap,
      destinations: _items
          .map(
            (item) => NavigationDestination(
              icon: Icon(item.icon),
              selectedIcon: Icon(item.activeIcon),
              label: item.label,
            ),
          )
          .toList(),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}