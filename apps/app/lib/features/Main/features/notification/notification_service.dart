import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';

class NotificationService {
  static String get _base => '${ENV.api}/core/notifications';

  Future<ApiResponse<List<NotificationData>>> getNotifications({
    int page = 1,
    int limit = 30,
  }) {
    return ApiClient.get(
      '$_base?page=$page&limit=$limit',
      fromJsonT: NotificationData.listFromJson,
    );
  }

  Future<ApiResponse<Map<String, dynamic>>> markAsRead(String id) {
    return ApiClient.patch(
      '$_base/$id/read',
      {},
      fromJsonT: (json) => json is Map<String, dynamic> ? json : {},
    );
  }

  Future<ApiResponse<Map<String, dynamic>>> markAllAsRead() {
    return ApiClient.patch(
      '$_base/read-all',
      {},
      fromJsonT: (json) => json is Map<String, dynamic> ? json : {},
    );
  }

  Stream<NotificationRealtimeEvent> streamNotifications() {
    return ApiClient.stream(
      '$_base/stream',
      fromJsonT: (json) => NotificationRealtimeEvent.fromJson(
        json is Map<String, dynamic> ? json : {},
      ),
    );
  }
}

class NotificationRealtimeEvent {
  final String type;
  final NotificationData? notification;

  NotificationRealtimeEvent({
    required this.type,
    this.notification,
  });

  factory NotificationRealtimeEvent.fromJson(Map<String, dynamic> json) {
    final notification = json['notification'];

    return NotificationRealtimeEvent(
      type: json['type']?.toString() ?? '',
      notification: notification is Map<String, dynamic>
          ? NotificationData.fromJson(notification)
          : null,
    );
  }
}

class NotificationData {
  final String id;
  final String title;
  final String message;
  final bool isRead;
  final DateTime createdAt;

  NotificationData({
    required this.id,
    required this.title,
    required this.message,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationData.fromJson(Map<String, dynamic> json) {
    return NotificationData(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      message: json['message']?.toString() ?? '',
      isRead: json['isRead'] == true,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
          DateTime.now(),
    );
  }

  static List<NotificationData> listFromJson(dynamic json) {
    final items = json is List ? json : const [];
    return items
        .whereType<Map<String, dynamic>>()
        .map(NotificationData.fromJson)
        .where((item) => item.id.isNotEmpty)
        .toList();
  }
}
