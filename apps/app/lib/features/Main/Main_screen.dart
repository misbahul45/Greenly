import 'package:app/features/favorite/favorite_screen.dart';
import 'package:app/features/Main/features/home/home_screen.dart';
import 'package:app/features/Main/features/notification/notification_screen.dart';
import 'package:app/features/Main/features/profile/profile_screen.dart';
import 'package:app/features/Main/widgets/main_app_bar.dart';
import 'package:app/features/Main/widgets/main_bottom_bar.dart';
import 'package:flutter/material.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int currentIndex = 0;

  final List<Widget> screens = const [
    HomeScreen(),
    NotificationScreen(),
    FavoriteScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: MainAppBar(
        currentIndex: currentIndex,
      ),

      body: IndexedStack(
        index: currentIndex,
        children: screens,
      ),

      bottomNavigationBar: MainBottomBar(
        currentIndex: currentIndex,
        onTap: _changeTab,
      ),
    );
  }

  void _changeTab(int index) {
    setState(() {
      currentIndex = index;
    });
  }
}