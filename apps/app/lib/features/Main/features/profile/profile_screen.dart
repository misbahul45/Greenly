import 'package:app/core/constants/ui_constants.dart';
import 'package:app/features/Main/features/profile/widgets/become_seller_widget.dart';
import 'package:app/features/Main/features/profile/widgets/my_action_widget.dart';
import 'package:app/features/Main/features/profile/widgets/my_activities_widget.dart';
import 'package:app/features/Main/features/profile/widgets/my_orders_widget.dart';
import 'package:app/features/Main/features/profile/widgets/profile_widget.dart';
import 'package:app/features/Main/features/profile/widgets/statistic_widget.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Future<void> _becomeSeller() async {
    final url = Uri.parse("https://your-seller-page.com");

    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      throw Exception("Could not launch $url");
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const ProfileWidget(),
          const SizedBox(height: UIConstants.spacingXL),
          BecomeSellerWidget(
            onTap: _becomeSeller,
          ),
          const SizedBox(height: UIConstants.spacingXL),
          const StatisticWidget(
            ordersCount: 12,
            followingCounts: 34,
            reviewsCount: 56,
            favoritesCount: 78,
          ),
          const SizedBox(height: UIConstants.spacingXL),
          const MyOrdersWidget(),
          const SizedBox(height: UIConstants.spacingXL),
          const MyActivitiesWidget(),
          const SizedBox(height: UIConstants.spacingXL),
          const MyActionWidget()
        ],
      ),
    );
  }
}
