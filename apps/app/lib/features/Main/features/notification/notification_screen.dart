import 'dart:async';

import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/Main/features/notification/notification_service.dart';
import 'package:flutter/material.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  final NotificationService _service = NotificationService();
  StreamSubscription<NotificationRealtimeEvent>? _subscription;
  bool _loading = true;
  String? _error;
  List<NotificationData> _items = [];

  @override
  void initState() {
    super.initState();
    _loadNotifications();
    _subscribeRealtime();
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    final response = await _service.getNotifications();

    setState(() {
      _loading = false;
      if (response.isSuccess) {
        _items = response.data ?? [];
      } else {
        _error = response.message;
      }
    });
  }

  Future<void> _markAsRead(NotificationData item) async {
    if (item.isRead) return;
    await _service.markAsRead(item.id);
    await _loadNotifications();
  }

  Future<void> _markAllAsRead() async {
    await _service.markAllAsRead();
    await _loadNotifications();
  }

  void _subscribeRealtime() {
    _subscription?.cancel();
    _subscription = _service.streamNotifications().listen((event) {
      final notification = event.notification;
      if (!mounted || notification == null) return;

      setState(() {
        _items = [
          notification,
          ..._items.where((item) => item.id != notification.id),
        ];
      });
    });
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(UIConstants.paddingL),
          child: Text(_error!, textAlign: TextAlign.center),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadNotifications,
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Notifikasi',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  TextButton(
                    onPressed: _items.any((item) => !item.isRead)
                        ? _markAllAsRead
                        : null,
                    child: const Text('Tandai dibaca'),
                  ),
                ],
              ),
            ),
          ),
          if (_items.isEmpty)
            const SliverFillRemaining(
              hasScrollBody: false,
              child: Center(child: Text('Belum ada notifikasi')),
            )
          else
            SliverList.separated(
              itemCount: _items.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final item = _items[index];
                return ListTile(
                  onTap: () => _markAsRead(item),
                  leading: CircleAvatar(
                    backgroundColor: item.isRead
                        ? Colors.grey.shade100
                        : AppTheme.primaryColor.withOpacity(0.12),
                    child: Icon(
                      item.isRead
                          ? Icons.notifications_none
                          : Icons.notifications_active,
                      color: item.isRead
                          ? Colors.grey.shade600
                          : AppTheme.primaryColor,
                    ),
                  ),
                  title: Text(
                    item.title,
                    style: TextStyle(
                      fontWeight:
                          item.isRead ? FontWeight.w600 : FontWeight.w800,
                    ),
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(item.message),
                  ),
                  trailing: item.isRead
                      ? null
                      : Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppTheme.primaryColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                );
              },
            ),
        ],
      ),
    );
  }
}
