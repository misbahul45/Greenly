import 'package:app/features/Main/main_screen.dart';
import 'package:app/features/Main/features/chat/chat_list_screen.dart';
import 'package:app/features/Main/features/chat/chat_screen.dart';
import 'package:app/features/categories/all_categories_screen.dart';
import 'package:app/features/auth/presentation/screens/change_password_screen.dart';
import 'package:app/features/auth/presentation/screens/verify_password_screen.dart';
import 'package:app/features/cart/presentation/screens/cart_screen.dart';
import 'package:app/features/favorite/favorite_screen.dart';
import 'package:app/features/onboarding/presentation/screens/onboarding_coordinator_screen.dart';
import 'package:app/features/onboarding/presentation/screens/splash_screen.dart';
import 'package:app/features/order/presentation/screens/order_list_screen.dart';
import 'package:app/features/order/presentation/screens/order_detail_screen.dart';
import 'package:app/features/order/presentation/screens/payment_webview_screen.dart';
import 'package:app/features/products/presentation/screens/product_list_screen.dart';
import 'package:app/features/Main/features/profile/screens/edit_profile_screen.dart';
import 'package:app/features/shop/presentation/screens/following_shops_screen.dart';
import 'package:app/features/shop/presentation/screens/shop_detail_screen.dart';
import 'package:app/features/product-detail/product_detail_screen.dart';
import 'package:app/features/product-detail/reviews_screen.dart';
import 'package:app/features/search-product/search_product_screen.dart';
import 'package:flutter/material.dart';

import 'package:app/features/auth/presentation/screens/login_screen.dart';
import 'package:app/features/auth/presentation/screens/forgot_password_screen.dart';
import 'package:app/features/auth/presentation/screens/register_screen.dart';
import 'package:app/features/auth/presentation/screens/verify_email_screen.dart';

import 'auth_routes.dart';
import 'app_routes.dart';

class RouterGenerate {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case AuthRoutes.splash:
        return _page(const SplashScreen());

      case AuthRoutes.onboarding:
        return _page(const OnboardingCoordinatorScreen());

      case AuthRoutes.login:
        return _page(const LoginScreen());

      case AuthRoutes.register:
        return _page(const RegisterScreen());

      case AuthRoutes.forgotPassword:
        return _page(const ForgotPasswordScreen());

      case AuthRoutes.verifyEmail:
        return _page(const VerifyEmailScreen());

      case AuthRoutes.verifyPassword:
        return _page(const VerifyPasswordScreen());

      case AuthRoutes.changePassword:
        return _page(const ChangePasswordScreen());

      case AppRoutes.cart:
        return _page(const CartScreen());

      case AppRoutes.chatList:
        return _page(const ChatListScreen(showAppBar: true));

      case AppRoutes.chat:
        final args = (settings.arguments as Map?) ?? const {};
        final shopId = args['shopId']?.toString() ?? '';
        final shopName = args['shopName']?.toString() ?? '';
        if (shopId.isEmpty || shopName.isEmpty) {
          return _page(
            const Scaffold(
              body: Center(child: Text('Data toko tidak lengkap')),
            ),
          );
        }
        return _page(
          ChatScreen(
            shopId: shopId,
            shopName: shopName,
            shopAvatarUrl: args['shopAvatarUrl']?.toString(),
            productId: args['productId']?.toString(),
            productName: args['productName']?.toString(),
            productImageUrl: args['productImageUrl']?.toString(),
            productSlug: args['productSlug']?.toString(),
          ),
        );

      case AppRoutes.allCategories:
        return _page(const AllCategoriesScreen());

      case AppRoutes.favorites:
        return _page(const FavoriteScreen());

      case AppRoutes.main:
        return _page(const MainScreen());

      case AppRoutes.productDetail:
        final slug = settings.arguments as String;
        return _page(ProductDetailScreen(slug: slug));

      case AppRoutes.searchProduct:
        return _page(const SearchProductScreen());

      case AppRoutes.orders:
        return _page(const OrderListScreen());

      case AppRoutes.orderDetail:
        final orderId = settings.arguments as String;
        return _page(OrderDetailScreen(orderId: orderId));

      case AppRoutes.paymentWebview:
        final args = (settings.arguments as Map?) ?? const {};
        final paymentUrl = args['paymentUrl']?.toString() ?? '';
        final orderId = args['orderId']?.toString() ?? '';
        if (paymentUrl.isEmpty || orderId.isEmpty) {
          return _page(
            const Scaffold(
              body: Center(child: Text('Data pembayaran tidak lengkap')),
            ),
          );
        }
        return _page(
          PaymentWebViewScreen(paymentUrl: paymentUrl, orderId: orderId),
        );

      case AppRoutes.editProfile:
        return _page(const EditProfileScreen());

      case AppRoutes.shopFollowers:
        return _page(const FollowingShopsScreen());

      case AppRoutes.shopDetail:
        final args = (settings.arguments as Map?) ?? const {};
        return _page(
          ShopDetailScreen(
            shopId: args['shopId'] as String? ?? '',
            initiallyFollowing: args['following'] as bool? ?? false,
          ),
        );

      case AppRoutes.products:
        return _page(const ProductListScreen(title: 'Semua Produk'));

      case AppRoutes.categoryProducts:
        final args = (settings.arguments as Map?) ?? const {};
        return _page(
          ProductListScreen(
            categoryId: args['categoryId'] as String?,
            title: args['categoryName'] as String? ?? 'Produk',
          ),
        );

      case AppRoutes.reviews:
        final args = settings.arguments as Map<String, dynamic>;
        return _page(
          ReviewsScreen(
            productId: args['productId'] as String,
            productName: args['productName'] as String,
          ),
        );

      default:
        return _page(
          const Scaffold(body: Center(child: Text("Page Not Found"))),
        );
    }
  }

  static MaterialPageRoute _page(Widget child) {
    return MaterialPageRoute(builder: (_) => child);
  }
}
