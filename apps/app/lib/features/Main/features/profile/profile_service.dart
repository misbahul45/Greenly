import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/features/Main/features/profile/domain/data/profile_stats_data.dart';

class ProfileService {
  static String get _coreBase => '${ENV.api}/core';
  static String get _catalogBase => '${ENV.api}/catalog';

  Future<ProfileStatsData> getStats() async {
    final results = await Future.wait([
      _orderAndFollowing(),
      _totalOf('$_catalogBase/favorites'),
      _totalOf('$_catalogBase/reviews/mine'),
    ]);

    final orderFollowing = results[0] as ({int orders, int following});
    final favorites = results[1] as int;
    final reviews = results[2] as int;

    return ProfileStatsData(
      orders: orderFollowing.orders,
      following: orderFollowing.following,
      reviews: reviews,
      favorites: favorites,
    );
  }

  Future<({int orders, int following})> _orderAndFollowing() async {
    try {
      final res = await ApiClient.get<Map<String, dynamic>>(
        '$_coreBase/auth/me',
        fromJsonT: (json) => json as Map<String, dynamic>,
      );
      final stats = res.data?['stats'];
      if (stats is Map<String, dynamic>) {
        return (
          orders: _toInt(stats['totalOrders']),
          following: _toInt(stats['followingShops']),
        );
      }
    } catch (_) {}
    return (orders: 0, following: 0);
  }

  Future<int> _totalOf(String url) async {
    try {
      final res = await ApiClient.get(
        url,
        query: {'page': 1, 'limit': 1},
        fromJsonT: (json) => json,
      );
      return res.metaData?.total ?? 0;
    } catch (_) {
      return 0;
    }
  }

  int _toInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse('$value') ?? 0;
  }
}
