import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:app/features/product-detail/bloc/product_detail_event.dart';
import 'package:app/features/product-detail/bloc/product_detail_state.dart';
import 'package:app/features/product-detail/product_detail_service.dart';
import 'package:app/features/product-detail/product_review_service.dart';

class ProductDetailBloc extends Bloc<ProductDetailEvent, ProductDetailState> {
  final ProductDetailService productDetailService;
  final ProductReviewService productReviewService;
  String? _currentProductId;

  ProductDetailBloc({
    required this.productDetailService,
    required this.productReviewService,
  }) : super(const ProductDetailState()) {
    on<GetDetailProduct>(_onGetDetailProduct);
    on<GetProductReviewsRequested>(_onGetReviews);
    on<LoadMoreProductReviewsRequested>(_onLoadMoreReviews);
  }

  Future<void> _onGetDetailProduct(
    GetDetailProduct event,
    Emitter<ProductDetailState> emit,
  ) async {
    emit(
      state.copyWith(
        product: state.product.copyWith(isLoading: true, message: null),
        error: null,
      ),
    );

    final res = await productDetailService.getProducts(slug: event.slug);

    emit(
      state.copyWith(
        product: state.product.copyWith(
          isLoading: false,
          data: res.data?.data,
          message: res.isSuccess ? res.message : null,
        ),
        error: res.isSuccess ? null : res.message,
      ),
    );
  }

  Future<void> _onGetReviews(
    GetProductReviewsRequested event,
    Emitter<ProductDetailState> emit,
  ) async {
    _currentProductId = event.productId;

    emit(
      state.copyWith(
        reviews: state.reviews.copyWith(
          isLoading: true,
          page: 1,
          hasReachedMax: false,
          data: [],
          message: null,
        ),
      ),
    );

    final res = await productReviewService.getProductReviews(
      productId: event.productId,
      page: 1,
    );

    final reviews = res.data?.data ?? [];
    final meta = res.metaData;
    final page = meta?.page ?? 1;
    final lastPage = meta?.lastPage ?? 1;

    emit(
      state.copyWith(
        reviews: state.reviews.copyWith(
          isLoading: false,
          data: reviews,
          page: page,
          hasReachedMax: page >= lastPage,
          message: res.isSuccess ? res.message : null,
        ),
      ),
    );
  }

  Future<void> _onLoadMoreReviews(
    LoadMoreProductReviewsRequested event,
    Emitter<ProductDetailState> emit,
  ) async {
    final current = state.reviews;

    if (current.isLoadingMore || current.isLoading || current.hasReachedMax) {
      return;
    }

    emit(
      state.copyWith(
        reviews: current.copyWith(isLoadingMore: true, message: null),
      ),
    );

    final nextPage = current.page + 1;
    final res = await productReviewService.getProductReviews(
      productId: _currentProductId!,
      page: nextPage,
    );

    final newReviews = res.data?.data ?? [];
    final meta = res.metaData;
    final lastPage = meta?.lastPage ?? nextPage;

    emit(
      state.copyWith(
        reviews: current.copyWith(
          isLoadingMore: false,
          page: nextPage,
          hasReachedMax: nextPage >= lastPage,
          data: List.of(current.data)..addAll(newReviews),
          message: res.isSuccess ? res.message : null,
        ),
      ),
    );
  }
}
