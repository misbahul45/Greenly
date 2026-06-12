import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';
import 'package:app/features/order/domain/data/order_data.dart';
import 'package:app/features/order/domain/dto/checkout_dto.dart';

class OrderService {
  static String get _ordersBase => '${ENV.api}/core/orders';
  static String get _checkoutBase => '${ENV.api}/core/checkout';
  static String get _stripeBase => '${ENV.api}/core/payments/stripe';

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
}
