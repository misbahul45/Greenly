import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:Greenly/core/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
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
  WebViewController? _controller;
  int _progress = 0;
  bool _handledRedirect = false;
  String? _error;
  late final Uri? _paymentUri;

  @override
  void initState() {
    super.initState();
    _paymentUri = Uri.tryParse(widget.paymentUrl);
    final paymentUri = _paymentUri;
    if (paymentUri == null ||
        !(paymentUri.scheme == 'http' || paymentUri.scheme == 'https')) {
      _error = 'Link pembayaran tidak valid.';
      return;
    }

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
          onWebResourceError: (error) {
            if (!mounted) return;
            setState(() {
              _error = 'Gagal memuat halaman pembayaran. Coba lagi.';
            });
          },
        ),
      );

    _controller?.loadRequest(paymentUri);
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

  Future<void> _retry() async {
    final uri = _paymentUri;
    if (uri == null) return;
    setState(() {
      _error = null;
      _progress = 0;
    });
    await _controller?.loadRequest(uri);
  }

  Future<void> _openExternal() async {
    final uri = _paymentUri;
    if (uri == null) return;
    await launchUrl(uri, mode: LaunchMode.externalApplication);
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
            Expanded(
              child: _error == null
                  ? WebViewWidget(controller: _controller!)
                  : _PaymentErrorView(
                      message: _error!,
                      canRetry: _paymentUri != null,
                      onRetry: _retry,
                      onOpenExternal: _openExternal,
                      onClose: () => Navigator.pop(context, false),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PaymentErrorView extends StatelessWidget {
  final String message;
  final bool canRetry;
  final VoidCallback onRetry;
  final VoidCallback onOpenExternal;
  final VoidCallback onClose;

  const _PaymentErrorView({
    required this.message,
    required this.canRetry,
    required this.onRetry,
    required this.onOpenExternal,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(UIConstants.paddingL),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.payment_rounded, size: 52, color: Colors.grey[300]),
            const SizedBox(height: UIConstants.spacingM),
            const Text(
              'Pembayaran Tidak Bisa Dimuat',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: UIConstants.fontSizeL,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: UIConstants.spacingS),
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[600]),
            ),
            const SizedBox(height: UIConstants.spacingL),
            if (canRetry)
              ElevatedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Coba Lagi'),
              ),
            if (canRetry)
              TextButton.icon(
                onPressed: onOpenExternal,
                icon: const Icon(Icons.open_in_new_rounded),
                label: const Text('Buka di Browser'),
              ),
            TextButton(onPressed: onClose, child: const Text('Tutup')),
          ],
        ),
      ),
    );
  }
}
