import 'package:app/core/constants/ui_constants.dart';
import 'package:app/shared/widgets/section_title_widget.dart';
import 'package:flutter/material.dart';

class AddressFormSectionWidget extends StatelessWidget {
  final TextEditingController receiverNameController;
  final TextEditingController phoneController;
  final TextEditingController addressLineController;
  final TextEditingController cityController;
  final TextEditingController provinceController;
  final TextEditingController postalCodeController;
  final TextEditingController notesController;
  final bool enabled;

  const AddressFormSectionWidget({
    super.key,
    required this.receiverNameController,
    required this.phoneController,
    required this.addressLineController,
    required this.cityController,
    required this.provinceController,
    required this.postalCodeController,
    required this.notesController,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionTitleWidget(title: 'Alamat Pengiriman'),
        const SizedBox(height: UIConstants.spacingM),
        _field(
          controller: receiverNameController,
          label: 'Nama Penerima',
          hint: 'Nama penerima paket',
          icon: Icons.person_pin_outlined,
          validator: _required('Nama penerima wajib diisi'),
        ),
        const SizedBox(height: UIConstants.spacingL),
        _field(
          controller: phoneController,
          label: 'Telepon Penerima',
          hint: '08xxxxxxxxxx',
          icon: Icons.phone_outlined,
          keyboardType: TextInputType.phone,
          validator: (value) {
            final text = value?.trim() ?? '';
            if (text.isEmpty) return 'Telepon penerima wajib diisi';
            if (text.length < 8) return 'Telepon minimal 8 digit';
            return null;
          },
        ),
        const SizedBox(height: UIConstants.spacingL),
        _field(
          controller: addressLineController,
          label: 'Alamat Lengkap',
          hint: 'Nama jalan, nomor rumah, RT/RW',
          icon: Icons.location_on_outlined,
          maxLines: 2,
          keyboardType: TextInputType.streetAddress,
          validator: _required('Alamat lengkap wajib diisi'),
        ),
        const SizedBox(height: UIConstants.spacingL),
        Row(
          children: [
            Expanded(
              child: _field(
                controller: cityController,
                label: 'Kota',
                hint: 'Kota',
                icon: Icons.location_city_outlined,
                validator: _required('Kota wajib diisi'),
              ),
            ),
            const SizedBox(width: UIConstants.spacingM),
            Expanded(
              child: _field(
                controller: provinceController,
                label: 'Provinsi',
                hint: 'Provinsi',
                icon: Icons.map_outlined,
                validator: _required('Provinsi wajib diisi'),
              ),
            ),
          ],
        ),
        const SizedBox(height: UIConstants.spacingL),
        _field(
          controller: postalCodeController,
          label: 'Kode Pos',
          hint: '12345',
          icon: Icons.markunread_mailbox_outlined,
          keyboardType: TextInputType.number,
          validator: (value) {
            final text = value?.trim() ?? '';
            if (text.isEmpty) return 'Kode pos wajib diisi';
            if (text.length < 5) return 'Kode pos minimal 5 digit';
            return null;
          },
        ),
        const SizedBox(height: UIConstants.spacingL),
        _field(
          controller: notesController,
          label: 'Catatan',
          hint: 'Contoh: dekat gerbang utama',
          icon: Icons.sticky_note_2_outlined,
          maxLines: 2,
        ),
      ],
    );
  }

  Widget _field({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    String? Function(String?)? validator,
    TextInputType? keyboardType,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: UIConstants.fontSizeM,
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: UIConstants.spacingXS),
        TextFormField(
          controller: controller,
          enabled: enabled,
          validator: validator,
          keyboardType: keyboardType,
          maxLines: maxLines,
          autovalidateMode: AutovalidateMode.onUserInteraction,
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(icon, size: UIConstants.iconSizeM),
          ),
        ),
      ],
    );
  }

  String? Function(String?) _required(String message) {
    return (value) => value == null || value.trim().isEmpty ? message : null;
  }
}
