import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class OnboardingStorage {
  static const String _hasSeenOnboarding = 'has_seen_onboarding';
  static const String _selectedCategories = 'selected_categories';
  static const String _selectedEcoGoals = 'selected_eco_goals';
  static const String _locationGranted = 'location_granted';
  static const String _notifGranted = 'notif_granted';

  static Future<bool> hasSeenOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_hasSeenOnboarding) ?? false;
  }

  static Future<void> saveOnboardingData({
    required List<String> selectedCategories,
    required List<String> selectedEcoGoals,
    required bool locationGranted,
    required bool notifGranted,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_hasSeenOnboarding, true);
    await prefs.setString(_selectedCategories, jsonEncode(selectedCategories));
    await prefs.setString(_selectedEcoGoals, jsonEncode(selectedEcoGoals));
    await prefs.setBool(_locationGranted, locationGranted);
    await prefs.setBool(_notifGranted, notifGranted);
  }

  static Future<List<String>> getSelectedCategories() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_selectedCategories);
    if (raw == null) return [];
    return List<String>.from(jsonDecode(raw));
  }

  static Future<List<String>> getSelectedEcoGoals() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_selectedEcoGoals);
    if (raw == null) return [];
    return List<String>.from(jsonDecode(raw));
  }
}
