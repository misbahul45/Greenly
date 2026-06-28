import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';
import 'package:app/features/order/domain/data/order_data.dart';
import 'package:app/features/order/domain/dto/checkout_dto.dart';

class OrderSummaryData {
  final int pending;
  final int paid;
  final int processing;
  final int shipped;
  final int completed;
  final int cancelled;

  const OrderSummaryData({
    this.pending = 0,
    this.paid = 0,
    this.processing = 0,
    this.shipped = 0,
    this.completed = 0,
    this.cancelled = 0,
  });
}

class OrderService {
  static String get _ordersBase => '${ENV.coreApiUrl}/orders';
  static String get _checkoutBase => '${ENV.coreApiUrl}/checkout';
  static String get _stripeBase => '${ENV.coreApiUrl}/payments/stripe';

  Future<ApiResponse<List<OrderData>>> getMyOrders({
    int page = 1,
    int limit = 20,
    String? status,
  }) {
    return ApiClient.get<List<OrderData>>(
      _ordersBase,
      query: {
        'page': page,
        'limit': limit,
        if (status != null && status.isNotEmpty) 'status': status,
      },
      fromJsonT: OrderData.listFromJson,
    );
  }

  Future<ApiResponse<OrderData>> getById(String orderId) {
    return ApiClient.get<OrderData>(
      '$_ordersBase/$orderId',
      fromJsonT: (json) => OrderData.fromJson(json),
    );
  }

  Future<ApiResponse<CheckoutResultData>> checkout(CheckoutDto dto) {
    return ApiClient.post<CheckoutResultData>(
      _checkoutBase,
      dto.toJson(),
      fromJsonT: (json) => CheckoutResultData.fromJson(json),
    );
  }

  Future<ApiResponse<CheckoutResultData>> resumePayment(String orderId) {
    return ApiClient.post<CheckoutResultData>(
      '$_stripeBase/create-intent',
      {'orderId': orderId},
      fromJsonT: (json) => CheckoutResultData.fromJson(json),
    );
  }

  Future<OrderSummaryData> getOrderSummary() async {
    final statuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
    final results = await Future.wait(
      statuses.map((status) => _countOf(status)),
    );
    return OrderSummaryData(
      pending: results[0],
      paid: results[1],
      processing: results[2],
      shipped: results[3],
      completed: results[4],
      cancelled: results[5],
    );
  }

  Future<int> _countOf(String status) async {
    try {
      final res = await ApiClient.get(
        _ordersBase,
        query: {'page': 1, 'limit': 1, 'status': status},
        fromJsonT: (json) => json,
      );
      return res.metaData?.total ?? 0;
    } catch (_) {
      return 0;
    }
  }

  Future<ApiResponse<dynamic>> cancelOrder(String orderId) {
    return ApiClient.patch<dynamic>(
      '$_ordersBase/$orderId/status',
      {'status': 'CANCELLED'},
    );
  }
}
