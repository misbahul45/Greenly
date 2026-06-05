import 'package:app/core/constants/ui_constants.dart';
import 'package:app/features/Main/features/profile/bloc/profile_bloc.dart';
import 'package:app/features/Main/features/profile/profile_service.dart';
import 'package:app/features/Main/features/profile/widgets/become_seller_widget.dart';
import 'package:app/features/Main/features/profile/widgets/my_action_widget.dart';
import 'package:app/features/Main/features/profile/widgets/my_activities_widget.dart';
import 'package:app/features/Main/features/profile/widgets/my_orders_widget.dart';
import 'package:app/features/Main/features/profile/widgets/profile_widget.dart';
import 'package:app/features/Main/features/profile/widgets/statistic_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ProfileBloc(ProfileService())..add(ProfileStatsRequested()),
      child: const _ProfileView(),
    );
  }
}

class _ProfileView extends StatelessWidget {
  const _ProfileView();

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () async =>
            context.read<ProfileBloc>().add(ProfileStatsRequested()),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const ProfileWidget(),
            const SizedBox(height: UIConstants.spacingXL),
            BecomeSellerWidget(
              onTap: () => ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Fitur buka toko segera hadir')),
              ),
            ),
            const SizedBox(height: UIConstants.spacingXL),
            BlocBuilder<ProfileBloc, ProfileState>(
              builder: (context, state) {
                final s = state.stats;
                return StatisticWidget(
                  ordersCount: s.orders,
                  followingCounts: s.following,
                  reviewsCount: s.reviews,
                  favoritesCount: s.favorites,
                );
              },
            ),
            const SizedBox(height: UIConstants.spacingXL),
            const MyOrdersWidget(),
            const SizedBox(height: UIConstants.spacingXL),
            const MyActivitiesWidget(),
            const SizedBox(height: UIConstants.spacingXL),
            const MyActionWidget(),
          ],
        ),
      ),
    );
  }
}
