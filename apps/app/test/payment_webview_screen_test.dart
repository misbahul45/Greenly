import 'package:app/features/order/presentation/screens/payment_webview_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('payment webview shows error for invalid URL', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: PaymentWebViewScreen(paymentUrl: 'not-a-url', orderId: 'order-1'),
      ),
    );

    expect(find.text('Pembayaran Tidak Bisa Dimuat'), findsOneWidget);
    expect(find.text('Link pembayaran tidak valid.'), findsOneWidget);
    expect(find.text('Tutup'), findsOneWidget);
  });
}
