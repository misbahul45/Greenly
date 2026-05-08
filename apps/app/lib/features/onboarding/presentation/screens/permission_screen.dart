import 'package:flutter/material.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/onboarding/presentation/widgets/permission_card_widget.dart';

class PermissionScreen extends StatefulWidget {
  final ValueChanged<bool> onLocationChanged;
  final ValueChanged<bool> onNotifChanged;
  final VoidCallback onFinish;

  const PermissionScreen({
    super.key,
    required this.onLocationChanged,
    required this.onNotifChanged,
    required this.onFinish,
  });

  @override
  State<PermissionScreen> createState() => _PermissionScreenState();
}

class _PermissionScreenState extends State<PermissionScreen> {
  bool _locationResolved = false;
  bool _locationGranted = false;
  bool _notifResolved = false;
  bool _notifGranted = false;

  Future<void> _requestLocation() async {
    await Future.delayed(const Duration(milliseconds: 600));
    setState(() {
      _locationGranted = true;
      _locationResolved = true;
    });
    widget.onLocationChanged(true);
  }

  Future<void> _requestNotif() async {
    await Future.delayed(const Duration(milliseconds: 600));
    setState(() {
      _notifGranted = true;
      _notifResolved = true;
    });
    widget.onNotifChanged(true);
  }

  void _skipLocation() => setState(() {
    _locationResolved = true;
    _locationGranted = false;
    widget.onLocationChanged(false);
  });

  void _skipNotif() => setState(() {
    _notifResolved = true;
    _notifGranted = false;
    widget.onNotifChanged(false);
  });

  bool get _canFinish => _locationResolved || _notifResolved;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 32),
              const Text(
                'Izinkan akses',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: Colors.black87,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Untuk pengalaman belanja eco yang lebih personal',
                style: TextStyle(fontSize: 14, color: Colors.grey[600]),
              ),
              const SizedBox(height: 32),
              PermissionCardWidget(
                icon: Icons.location_on_rounded,
                iconColor: AppTheme.primaryColor,
                title: 'Temukan Toko Terdekat',
                description:
                    'Kami gunakan lokasi untuk merekomendasikan produk dan toko eco-friendly di sekitarmu.',
                isResolved: _locationResolved,
                isGranted: _locationGranted,
                onAllow: _requestLocation,
                onSkip: _skipLocation,
              ),
              const SizedBox(height: 16),
              PermissionCardWidget(
                icon: Icons.notifications_rounded,
                iconColor: const Color(0xFFF57C00),
                title: 'Jangan Ketinggalan Promo',
                description:
                    'Dapatkan notifikasi flash sale, produk baru, dan tips hidup ramah lingkungan.',
                isResolved: _notifResolved,
                isGranted: _notifGranted,
                onAllow: _requestNotif,
                onSkip: _skipNotif,
              ),
              const Spacer(),
              AnimatedOpacity(
                opacity: _canFinish ? 1.0 : 0.4,
                duration: const Duration(milliseconds: 300),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _canFinish ? widget.onFinish : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _canFinish
                          ? AppTheme.primaryColor
                          : Colors.grey[300],
                      foregroundColor: _canFinish
                          ? Colors.white
                          : Colors.grey[500],
                    ),
                    child: const Text(
                      'Lanjut ke Akun',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Center(
                child: TextButton(
                  onPressed: widget.onFinish,
                  child: Text(
                    'Lewati semua',
                    style: TextStyle(color: Colors.grey[500], fontSize: 13),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
