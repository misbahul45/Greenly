import 'package:app/features/Main/features/home/bloc/home_event.dart';
import 'package:app/features/Main/features/home/bloc/home_state.dart';
import 'package:app/features/Main/features/home/home_service.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class HomeBloc extends Bloc<HomeEvent, HomeState> {
  final HomeService homeService;

  HomeBloc(this.homeService) : super(const HomeState()) {
    on<GetActiveBannersRequested>(_onGetBanners);
    on<GetCategoriesRequested>(_onGetCategories);
    on<GetFeaturedProductsRequested>(_onGetProducts);
    on<LoadMoreProductsRequested>(_onLoadMoreProducts);
  }

  Future<void> _onGetBanners(
    GetActiveBannersRequested event,
    Emitter<HomeState> emit,
  ) async {
    emit(
      state.copyWith(
        banner: state.banner.copyWith(isLoading: true, message: null),
        error: null,
      ),
    );

    final res = await homeService.getActiveBanners();
    
    emit(
      state.copyWith(
        banner: state.banner.copyWith(
          isLoading: false,
          data: res.data?.data ?? [],
          message: res.isSuccess ? res.message : null,
        ),
        error: res.isSuccess ? null : res.message,
      ),
    );
  }

  Future<void> _onGetCategories(
    GetCategoriesRequested event,
    Emitter<HomeState> emit,
  ) async {
    emit(
      state.copyWith(
        category: state.category.copyWith(isLoading: true, message: null),
        error: null,
      ),
    );

    final res = await homeService.getCategories();

    emit(
      state.copyWith(
        category: state.category.copyWith(
          isLoading: false,
          data: res.data?.data ?? [],
          message: res.isSuccess ? res.message : null,
        ),
        error: res.isSuccess ? null : res.message,
      ),
    );
  }

  Future<void> _onGetProducts(
    GetFeaturedProductsRequested event,
    Emitter<HomeState> emit,
  ) async {
    emit(
      state.copyWith(
        product: state.product.copyWith(
          isLoading: true,
          page: 1,
          hasReachedMax: false,
          data: [],
          message: null,
        ),
        error: null,
      ),
    );

    final res = await homeService.getProducts(page: 1);

    final products = res.data?.data ?? [];
    final meta = res.metaData;

    final page = meta?.page ?? 1;
    final lastPage = meta?.lastPage ?? 1;

    emit(
      state.copyWith(
        product: state.product.copyWith(
          isLoading: false,
          data: products,
          page: page,
          hasReachedMax: page >= lastPage,
          message: res.isSuccess ? res.message : null,
        ),
        error: res.isSuccess ? null : res.message,
      ),
    );
  }

  Future<void> _onLoadMoreProducts(
    LoadMoreProductsRequested event,
    Emitter<HomeState> emit,
  ) async {
    final current = state.product;

    if (current.isLoadingMore || current.hasReachedMax) return;

    emit(
      state.copyWith(
        product: current.copyWith(isLoadingMore: true, message: null),
      ),
    );

    final nextPage = current.page + 1;

    final res = await homeService.getProducts(page: nextPage);

    final newProducts = res.data?.data ?? [];
    final meta = res.metaData;

    final lastPage = meta?.lastPage ?? nextPage;

    emit(
      state.copyWith(
        product: current.copyWith(
          isLoadingMore: false,
          page: nextPage,
          hasReachedMax: nextPage >= lastPage,
          data: List.of(current.data)..addAll(newProducts),
          message: res.isSuccess ? res.message : null,
        ),
        error: res.isSuccess ? null : res.message,
      ),
    );
  }
}