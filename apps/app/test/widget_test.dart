import 'package:Greenly/core/router/app_routes.dart';
import 'package:Greenly/core/router/router_generate.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('router shows fallback for invalid product detail args', (
    tester,
  ) async {
    await tester.pumpWidget(_routeHarness(AppRoutes.productDetail));

    expect(find.text('Data produk tidak tersedia'), findsOneWidget);
  });

  testWidgets('router shows fallback for invalid order detail args', (
    tester,
  ) async {
    await tester.pumpWidget(_routeHarness(AppRoutes.orderDetail));

    expect(find.text('Data pesanan tidak tersedia'), findsOneWidget);
  });

  testWidgets('router shows fallback for invalid review args', (tester) async {
    await tester.pumpWidget(_routeHarness(AppRoutes.reviews));

    expect(find.text('Data ulasan tidak tersedia'), findsOneWidget);
  });
}

Widget _routeHarness(String routeName) {
  return MaterialApp(
    home: Builder(
      builder: (context) {
        final route =
            RouterGenerate.generateRoute(RouteSettings(name: routeName))
                as MaterialPageRoute<dynamic>;
        return route.builder(context);
      },
    ),
  );
}
