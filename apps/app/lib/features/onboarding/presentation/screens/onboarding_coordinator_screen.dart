import 'package:flutter/material.dart';
import 'package:app/features/onboarding/presentation/screens/welcome_carousel_screen.dart';
import 'package:app/features/onboarding/presentation/screens/interest_screen.dart';
import 'package:app/features/onboarding/presentation/screens/permission_screen.dart';
import 'package:app/features/onboarding/data/onboarding_storage.dart';
import 'package:app/core/router/auth_routes.dart';

class OnboardingCoordinatorScreen extends StatefulWidget {
  const OnboardingCoordinatorScreen({super.key});

  @override
  State<OnboardingCoordinatorScreen> createState() =>
      _OnboardingCoordinatorScreenState();
}

class _OnboardingCoordinatorScreenState
    extends State<OnboardingCoordinatorScreen> {
  int _step = 0;
  final List<String> _selectedCategories = [];
  final List<String> _selectedEcoGoals = [];
  bool _locationGranted = false;
  bool _notifGranted = false;

  void _next() {
    if (_step < 2) {
      setState(() => _step++);
    } else {
      _finish();
    }
  }

  Future<void> _finish() async {
    await OnboardingStorage.saveOnboardingData(
      selectedCategories: _selectedCategories,
      selectedEcoGoals: _selectedEcoGoals,
      locationGranted: _locationGranted,
      notifGranted: _notifGranted,
    );

    if (!mounted) return;
    Navigator.pushReplacementNamed(context, AuthRoutes.login);
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 350),
      transitionBuilder: (child, anim) => SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(1, 0),
          end: Offset.zero,
        ).animate(CurvedAnimation(parent: anim, curve: Curves.easeInOut)),
        child: child,
      ),
      child: _step == 0
          ? WelcomeCarouselScreen(key: const ValueKey(0), onNext: _next)
          : _step == 1
          ? InterestScreen(
              key: const ValueKey(1),
              selectedCategories: _selectedCategories,
              selectedEcoGoals: _selectedEcoGoals,
              onNext: _next,
            )
          : PermissionScreen(
              key: const ValueKey(2),
              onLocationChanged: (v) => setState(() => _locationGranted = v),
              onNotifChanged: (v) => setState(() => _notifGranted = v),
              onFinish: _next,
            ),
    );
  }
}
