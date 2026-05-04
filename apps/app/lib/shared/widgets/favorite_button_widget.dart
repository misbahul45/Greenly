import 'package:app/features/favorite/bloc/favorite_bloc.dart';
import 'package:app/features/favorite/service/favorite_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class FavoriteButtonWidget extends StatelessWidget {
  final String productId;
  final Color? activeColor;
  final Color? inactiveColor;
  final double size;

  const FavoriteButtonWidget({
    super.key,
    required this.productId,
    this.activeColor = Colors.red,
    this.inactiveColor = Colors.grey,
    this.size = 24,
  });

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          FavoriteBloc(FavoriteService())
            ..add(FavoriteCheckRequested(productId: productId)),
      child: BlocConsumer<FavoriteBloc, FavoriteState>(
        listenWhen: (p, c) => c.error != null && p.error != c.error,
        listener: (context, state) {
          if (state.error != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.error!),
                duration: const Duration(seconds: 2),
              ),
            );
          }
        },
        builder: (context, state) {
          if (state.isLoading) {
            return SizedBox(
              width: size + 8,
              height: size + 8,
              child: const Center(
                child: SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            );
          }

          return IconButton(
            onPressed: state.isToggling
                ? null
                : () => context.read<FavoriteBloc>().add(
                    FavoriteToggleRequested(productId: productId),
                  ),
            icon: Icon(
              state.isFavorite ? Icons.favorite : Icons.favorite_border,
              color: state.isFavorite ? activeColor : inactiveColor,
              size: size,
            ),
          );
        },
      ),
    );
  }
}
