import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/Main/features/profile/domain/data/profile_detail_data.dart';
import 'package:app/shared/services/me_service.dart';
import 'package:app/shared/widgets/section_title_widget.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_box.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_card.dart';
import 'package:app/shared/widgets/skeleton/app_skeleton_line.dart';
import 'package:flutter/material.dart';

class AddressSectionWidget extends StatefulWidget {
  const AddressSectionWidget({super.key});

  @override
  State<AddressSectionWidget> createState() => _AddressSectionWidgetState();
}

class _AddressSectionWidgetState extends State<AddressSectionWidget> {
  late Future<ProfileDetailData?> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<ProfileDetailData?> _load() async {
    final res = await MeService.getProfileDetail();
    return res.isSuccess ? res.data : null;
  }

  Future<void> _openEdit() async {
    await Navigator.pushNamed(context, AppRoutes.editProfile);
    if (!mounted) return;
    setState(() {
      _future = _load();
    });
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<ProfileDetailData?>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const _AddressSkeleton();
        }

        final profile = snapshot.data;
        final address = profile?.addressData;
        final hasAddress =
            address != null &&
            (address.hasStructuredAddress ||
                (profile?.address != null && profile!.address!.isNotEmpty));

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SectionTitleWidget(title: 'Alamat Pengiriman'),
            const SizedBox(height: UIConstants.spacingS),
            Container(
              padding: const EdgeInsets.all(UIConstants.paddingM),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(UIConstants.radiusL),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(UIConstants.paddingS),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(UIConstants.radiusS),
                    ),
                    child: Icon(
                      hasAddress
                          ? Icons.home_outlined
                          : Icons.add_location_alt_outlined,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                  const SizedBox(width: UIConstants.spacingM),
                  Expanded(
                    child: hasAddress
                        ? _AddressText(
                            address: address.composed.isNotEmpty
                                ? address.composed
                                : profile!.address!,
                          )
                        : const _EmptyAddressText(),
                  ),
                  const SizedBox(width: UIConstants.spacingS),
                  TextButton(
                    onPressed: _openEdit,
                    child: Text(hasAddress ? 'Ubah' : 'Tambah'),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

class _AddressText extends StatelessWidget {
  final String address;

  const _AddressText({required this.address});

  @override
  Widget build(BuildContext context) {
    final lines = address.split('\n');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          lines.first,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            fontSize: UIConstants.fontSizeL,
            fontWeight: FontWeight.w700,
          ),
        ),
        if (lines.length > 1) ...[
          const SizedBox(height: UIConstants.spacingXS),
          Text(
            lines.skip(1).join('\n'),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: UIConstants.fontSizeS,
              color: Colors.grey[600],
              height: 1.35,
            ),
          ),
        ],
      ],
    );
  }
}

class _EmptyAddressText extends StatelessWidget {
  const _EmptyAddressText();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Tambah Alamat',
          style: TextStyle(
            fontSize: UIConstants.fontSizeL,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: UIConstants.spacingXS),
        Text(
          'Lengkapi alamat penerima untuk proses checkout.',
          style: TextStyle(
            fontSize: UIConstants.fontSizeS,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }
}

class _AddressSkeleton extends StatelessWidget {
  const _AddressSkeleton();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: const [
        AppSkeletonLine(width: 136, height: 15),
        SizedBox(height: UIConstants.spacingS),
        AppSkeletonCard(
          child: Row(
            children: [
              AppSkeletonBox(
                width: 40,
                height: 40,
                radius: UIConstants.radiusS,
              ),
              SizedBox(width: UIConstants.spacingM),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppSkeletonLine(width: 150, height: 14),
                    SizedBox(height: UIConstants.spacingS),
                    AppSkeletonLine(height: 11),
                    SizedBox(height: UIConstants.spacingXS),
                    AppSkeletonLine(width: 210, height: 11),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
