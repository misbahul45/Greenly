import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/shop/domain/data/shop_data.dart';
import 'package:app/features/shop/service/shop_service.dart';
import 'package:flutter/material.dart';

class ShopInfoWidget extends StatefulWidget {
  final String shopId;
  final String? shopName;
  final String? categoryName;
  final String? productId;
  final String? productName;
  final String? productImageUrl;
  final String? productSlug;

  const ShopInfoWidget({
    super.key,
    required this.shopId,
    this.shopName,
    this.categoryName,
    this.productId,
    this.productName,
    this.productImageUrl,
    this.productSlug,
  });

  @override
  State<ShopInfoWidget> createState() => _ShopInfoWidgetState();
}

class _ShopInfoWidgetState extends State<ShopInfoWidget> {
  late Future<ShopData?> _future;

  @override
  void initState() {
    super.initState();
    _future = _loadShop();
  }

  Future<ShopData?> _loadShop() async {
    if (widget.shopId.isEmpty) return null;
    final response = await ShopService().getShopById(widget.shopId);
    return response.isSuccess ? response.data : null;
  }

  void _openShop(ShopData? shop) {
    if (widget.shopId.isEmpty) return;
    Navigator.pushNamed(
      context,
      AppRoutes.shopDetail,
      arguments: {
        'shopId': widget.shopId,
        if (shop != null) 'shopName': shop.name,
        if (shop == null && widget.shopName != null) 'shopName': widget.shopName,
      },
    );
  }

  void _openChat(String name, String? avatarUrl) {
    Navigator.pushNamed(
      context,
      AppRoutes.chat,
      arguments: {
        'shopId': widget.shopId,
        'shopName': name,
        'shopAvatarUrl': avatarUrl,
        'productId': widget.productId,
        'productName': widget.productName,
        'productImageUrl': widget.productImageUrl,
        'productSlug': widget.productSlug,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<ShopData?>(
      future: _future,
      builder: (context, snapshot) {
        final shop = snapshot.data;
        final isLoading = snapshot.connectionState == ConnectionState.waiting;

        final displayName =
            shop?.name ??
            widget.shopName ??
            (isLoading ? 'Memuat toko...' : widget.categoryName ?? 'Toko');

        final canChat =
            !isLoading &&
            widget.shopId.isNotEmpty &&
            displayName.isNotEmpty;

        return Container(
          padding: const EdgeInsets.all(UIConstants.paddingM),
          decoration: BoxDecoration(
            color: Colors.grey[50],
            borderRadius: BorderRadius.circular(UIConstants.radiusM),
            border: Border.all(color: Colors.grey[200]!),
          ),
          child: Row(
            children: [
              _ShopAvatar(imageUrl: shop?.avatarUrl),
              const SizedBox(width: UIConstants.spacingM),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Toko',
                      style: TextStyle(
                        fontSize: UIConstants.fontSizeS,
                        color: Colors.grey,
                      ),
                    ),
                    Text(
                      displayName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: UIConstants.fontSizeL,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: UIConstants.spacingS),
              IconButton.outlined(
                tooltip: 'Chat Toko',
                onPressed: canChat
                    ? () => _openChat(displayName, shop?.avatarUrl)
                    : null,
                icon: const Icon(Icons.chat_bubble_outline_rounded),
              ),
              const SizedBox(width: UIConstants.spacingXS),
              TextButton(
                onPressed:
                    widget.shopId.isEmpty ? null : () => _openShop(shop),
                child: const Text('Kunjungi'),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _ShopAvatar extends StatelessWidget {
  final String? imageUrl;

  const _ShopAvatar({required this.imageUrl});

  @override
  Widget build(BuildContext context) {
    if (imageUrl != null && imageUrl!.isNotEmpty) {
      return CircleAvatar(
        radius: 24,
        backgroundImage: NetworkImage(imageUrl!),
        backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
      );
    }

    return CircleAvatar(
      radius: 24,
      backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
      child: const Icon(
        Icons.storefront_rounded,
        color: AppTheme.primaryColor,
      ),
    );
  }
}
