import 'package:flutter/material.dart';

class MainBottomBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const MainBottomBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  static const List<Map<String, dynamic>> navItems = [
    {
      "icon": Icons.home_outlined,
      "label": "Home",
    },
    {
      "icon": Icons.notifications_none,
      "label": "Notif",
    },
    {
      "icon": Icons.chat_bubble_outline,
      "label": "Chat",
    },
    {
      "icon": Icons.favorite_border,
      "label": "Favorite",
    },
    {
      "icon": Icons.person_outline,
      "label": "Account",
    },
  ];

  @override
  Widget build(BuildContext context) {
    return NavigationBar(
      selectedIndex: currentIndex,
      onDestinationSelected: onTap,
      destinations: navItems.map((item){
        return NavigationDestination(
          icon: Icon(item["icon"] as IconData),
          label: item["label"] as String,
        );
      }).toList(),
    );
  }
}
