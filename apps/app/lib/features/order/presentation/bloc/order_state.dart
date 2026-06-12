part of 'order_bloc.dart';

class OrderState extends Equatable {
  final List<OrderData> data;
  final bool isLoading;
  final bool isLoadingMore;
  final int page;
  final bool hasReachedMax;
  final String? statusFilter;
  final String? error;

  final OrderData? detail;
  final bool isDetailLoading;
  final String? detailError;

  const OrderState({
    this.data = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.page = 1,
    this.hasReachedMax = false,
    this.statusFilter,
    this.error,
    this.detail,
    this.isDetailLoading = false,
    this.detailError,
  });

  OrderState copyWith({
    List<OrderData>? data,
    bool? isLoading,
    bool? isLoadingMore,
    int? page,
    bool? hasReachedMax,
    String? statusFilter,
    bool clearStatusFilter = false,
    String? error,
    OrderData? detail,
    bool? isDetailLoading,
    String? detailError,
  }) {
    return OrderState(
      data: data ?? this.data,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      page: page ?? this.page,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      statusFilter: clearStatusFilter ? null : (statusFilter ?? this.statusFilter),
      error: error,
      detail: detail ?? this.detail,
      isDetailLoading: isDetailLoading ?? this.isDetailLoading,
      detailError: detailError,
    );
  }

  @override
  List<Object?> get props => [
    data,
    isLoading,
    isLoadingMore,
    page,
    hasReachedMax,
    statusFilter,
    error,
    detail,
    isDetailLoading,
    detailError,
  ];
}
