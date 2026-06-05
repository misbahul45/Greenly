import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class PaymentWebViewScreen extends StatefulWidget {
  final String paymentUrl;
  final String orderId;

  const PaymentWebViewScreen({
    super.key,
    required this.paymentUrl,
    required this.orderId,
  });

  @override
  State<PaymentWebViewScreen> createState() => _PaymentWebViewScreenState();
}

class _PaymentWebViewScreenState extends State<PaymentWebViewScreen> {
  late final WebViewController _controller;
  int _progress = 0;
  bool _handledRedirect = false;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (progress) {
            if (mounted) setState(() => _progress = progress);
          },
          onNavigationRequest: (request) {
            final action = _detectRedirect(request.url);
            if (action != null) {
              _finish(action);
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.paymentUrl));
  }

  String? _detectRedirect(String url) {
    final uri = Uri.tryParse(url);
    final text = url.toLowerCase();
    final status = uri?.queryParameters['status']?.toLowerCase();

    if (text.contains('payment-success') ||
        text.contains('stripe-success') ||
        status == 'success') {
      return 'success';
    }

    if (text.contains('payment-cancel') ||
        text.contains('stripe-cancel') ||
        status == 'cancel' ||
        status == 'cancelled') {
      return 'cancel';
    }

    return null;
  }

  void _finish(String action) {
    if (_handledRedirect || !mounted) return;
    _handledRedirect = true;

    final isSuccess = action == 'success';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          isSuccess
              ? 'Pembayaran sedang diverifikasi'
              : 'Pembayaran dibatalkan',
        ),
        backgroundColor: isSuccess ? AppTheme.primaryColor : Colors.orange,
      ),
    );
    Navigator.pop(context, isSuccess);
  }

  Future<void> _confirmClose() async {
    final shouldClose = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Tutup Pembayaran?'),
        content: const Text(
          'Pembayaran belum dikonfirmasi. Kamu bisa melanjutkan dari detail pesanan.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Tetap di Sini'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Tutup'),
          ),
        ],
      ),
    );

    if (shouldClose == true && mounted) {
      Navigator.pop(context, false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) _confirmClose();
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.close_rounded),
            onPressed: _confirmClose,
          ),
          centerTitle: true,
          title: const Text(
            'Pembayaran Stripe',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
          ),
        ),
        body: Column(
          children: [
            if (_progress < 100)
              LinearProgressIndicator(
                value: _progress / 100,
                minHeight: 2,
                color: AppTheme.primaryColor,
                backgroundColor: AppTheme.tertiaryColor.withValues(alpha: 0.35),
              )
            else
              const SizedBox(height: 2),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(
                horizontal: UIConstants.paddingM,
                vertical: UIConstants.spacingS,
              ),
              color: const Color(0xFFF6FAF6),
              child: const Text(
                'Status pesanan diperbarui setelah Stripe mengirim verifikasi pembayaran.',
                style: TextStyle(
                  fontSize: UIConstants.fontSizeXS,
                  color: Colors.black54,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            Expanded(child: WebViewWidget(controller: _controller)),
          ],
        ),
      ),
    );
  }
}
