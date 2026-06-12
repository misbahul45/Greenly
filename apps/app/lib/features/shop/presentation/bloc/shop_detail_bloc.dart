import 'package:app/features/shop/domain/data/shop_data.dart';
import 'package:app/features/shop/service/shop_service.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'shop_detail_event.dart';
part 'shop_detail_state.dart';

class ShopDetailBloc extends Bloc<ShopDetailEvent, ShopDetailState> {
  final ShopService _service;

  ShopDetailBloc(this._service) : super(const ShopDetailState()) {
    on<ShopDetailRequested>(_onRequested);
    on<ShopFollowToggled>(_onToggle);
  }

  Future<void> _onRequested(
    ShopDetailRequested event,
    Emitter<ShopDetailState> emit,
  ) async {
    emit(
      state.copyWith(
        isLoading: true,
        error: null,
        isFollowing: event.initiallyFollowing,
      ),
    );

    final res = await _service.getShopById(event.shopId);

    emit(
      state.copyWith(
        isLoading: false,
        shop: res.data,
        followerCount: res.data?.followerCount ?? 0,
        error: res.isSuccess ? null : res.message,
      ),
    );
  }

  Future<void> _onToggle(
    ShopFollowToggled event,
    Emitter<ShopDetailState> emit,
  ) async {
    final shop = state.shop;
    if (shop == null || state.isToggling) return;

    final wasFollowing = state.isFollowing;

    emit(
      state.copyWith(
        isToggling: true,
        isFollowing: !wasFollowing,
        followerCount: (state.followerCount + (wasFollowing ? -1 : 1))
            .clamp(0, 1 << 31),
      ),
    );

    final res = wasFollowing
        ? await _service.unfollow(shop.id)
        : await _service.follow(shop.id);

    if (!res.isSuccess) {
      emit(
        state.copyWith(
          isToggling: false,
          isFollowing: wasFollowing,
          followerCount: shop.followerCount,
          error: res.message,
        ),
      );
      return;
    }

    emit(state.copyWith(isToggling: false));
  }
}
