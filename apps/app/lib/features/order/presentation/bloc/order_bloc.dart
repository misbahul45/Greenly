import 'package:app/features/order/domain/data/order_data.dart';
import 'package:app/features/order/service/order_service.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'order_event.dart';
part 'order_state.dart';

class OrderBloc extends Bloc<OrderEvent, OrderState> {
  final OrderService _service;

  OrderBloc(this._service) : super(const OrderState()) {
    on<OrderListRequested>(_onList);
    on<OrderLoadMoreRequested>(_onLoadMore);
    on<OrderDetailRequested>(_onDetail);
    on<OrderCancelRequested>(_onCancel);
  }

  Future<void> _onList(
    OrderListRequested event,
    Emitter<OrderState> emit,
  ) async {
    emit(
      state.copyWith(
        isLoading: true,
        statusFilter: event.status,
        clearStatusFilter: event.status == null,
        data: [],
        page: 1,
        hasReachedMax: false,
        error: null,
      ),
    );

    final res = await _service.getMyOrders(page: 1, status: event.status);
    final meta = res.metaData;
    final page = meta?.page ?? 1;
    final lastPage = meta?.lastPage ?? 1;

    emit(
      state.copyWith(
        isLoading: false,
        data: res.data ?? [],
        page: page,
        hasReachedMax: page >= lastPage,
        error: res.isSuccess ? null : res.message,
      ),
    );
  }

  Future<void> _onLoadMore(
    OrderLoadMoreRequested event,
    Emitter<OrderState> emit,
  ) async {
    if (state.isLoadingMore || state.isLoading || state.hasReachedMax) return;

    emit(state.copyWith(isLoadingMore: true));

    final nextPage = state.page + 1;
    final res = await _service.getMyOrders(
      page: nextPage,
      status: state.statusFilter,
    );
    final lastPage = res.metaData?.lastPage ?? nextPage;

    emit(
      state.copyWith(
        isLoadingMore: false,
        data: List.of(state.data)..addAll(res.data ?? []),
        page: nextPage,
        hasReachedMax: nextPage >= lastPage,
        error: res.isSuccess ? null : res.message,
      ),
    );
  }

  Future<void> _onDetail(
    OrderDetailRequested event,
    Emitter<OrderState> emit,
  ) async {
    emit(state.copyWith(isDetailLoading: true, detailError: null));

    final res = await _service.getById(event.orderId);

    emit(
      state.copyWith(
        isDetailLoading: false,
        detail: res.data,
        detailError: res.isSuccess ? null : res.message,
      ),
    );
  }

  Future<void> _onCancel(
    OrderCancelRequested event,
    Emitter<OrderState> emit,
  ) async {
    emit(state.copyWith(isCancelling: true, cancelError: null));

    final res = await _service.cancelOrder(event.orderId);

    if (res.isSuccess) {
      emit(state.copyWith(isCancelling: false));
      // Reload detail to reflect the updated status
      add(OrderDetailRequested(event.orderId));
    } else {
      emit(state.copyWith(
        isCancelling: false,
        cancelError: res.message,
      ));
    }
  }
}
