import 'dart:io';
import 'package:app/core/config/env.dart';
import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/features/Main/features/profile/domain/data/profile_detail_data.dart';
import 'package:app/features/Main/features/profile/widgets/address_form_section_widget.dart';
import 'package:app/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:app/features/auth/presentation/bloc/auth_event.dart';
import 'package:app/shared/domains/dto/update_profile_dto.dart';
import 'package:app/shared/services/me_service.dart';
import 'package:app/shared/widgets/skeleton/profile_skeleton.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _receiverNameController = TextEditingController();
  final _addressLineController = TextEditingController();
  final _cityController = TextEditingController();
  final _provinceController = TextEditingController();
  final _postalCodeController = TextEditingController();
  final _notesController = TextEditingController();

  bool _loading = true;
  bool _saving = false;
  bool _uploading = false;
  String _avatarUrl = '';
  File? _pickedFile;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final res = await MeService.getProfileDetail();
    if (!mounted) return;
    if (res.isSuccess && res.data != null) {
      final p = res.data!;
      final address = p.addressData;
      _nameController.text = p.fullName;
      _phoneController.text = address.phone ?? p.phone ?? '';
      _receiverNameController.text = address.receiverName ?? p.fullName;
      _addressLineController.text = address.addressLine ?? p.address ?? '';
      _cityController.text = address.city ?? '';
      _provinceController.text = address.province ?? '';
      _postalCodeController.text = address.postalCode ?? '';
      _notesController.text = address.notes ?? '';
      _avatarUrl = p.avatarUrl ?? '';
    }
    setState(() => _loading = false);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _receiverNameController.dispose();
    _addressLineController.dispose();
    _cityController.dispose();
    _provinceController.dispose();
    _postalCodeController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 512,
      maxHeight: 512,
      imageQuality: 80,
    );
    if (picked == null || !mounted) return;

    final file = File(picked.path);
    setState(() {
      _pickedFile = file;
      _uploading = true;
    });

    try {
      final res = await ApiClient.upload<Map<String, dynamic>>(
        url: '${ENV.catalogApiUrl}/product-images',
        files: [file],
        fileField: 'file',
        fromJsonT: (json) => json as Map<String, dynamic>,
      );

      if (!mounted) return;

      if (res.isSuccess && res.data != null) {
        final url = res.data!['url']?.toString() ?? '';
        if (url.isNotEmpty) {
          setState(() {
            _avatarUrl = url;
            _uploading = false;
          });
          return;
        }
      }

      // Upload failed — keep the local preview but show error
      setState(() => _uploading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res.message.isNotEmpty
                ? res.message
                : 'Gagal mengunggah gambar'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (_) {
      if (!mounted) return;
      setState(() => _uploading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Terjadi kesalahan saat mengunggah gambar'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_uploading) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tunggu hingga upload gambar selesai'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }
    setState(() => _saving = true);

    final address = ProfileAddressData(
      receiverName: _receiverNameController.text.trim(),
      phone: _phoneController.text.trim(),
      addressLine: _addressLineController.text.trim(),
      city: _cityController.text.trim(),
      province: _provinceController.text.trim(),
      postalCode: _postalCodeController.text.trim(),
      notes: _notesController.text.trim(),
    );

    final res = await MeService.updateProfile(
      UpdateProfileDto(
        name: _nameController.text.trim(),
        phone: _phoneController.text.trim(),
        address: address.composed,
        avatarUrl: _avatarUrl.isNotEmpty ? _avatarUrl : null,
        receiverName: _receiverNameController.text.trim(),
        addressLine: _addressLineController.text.trim(),
        city: _cityController.text.trim(),
        province: _provinceController.text.trim(),
        postalCode: _postalCodeController.text.trim(),
        notes: _notesController.text.trim(),
      ),
    );

    if (!mounted) return;
    setState(() => _saving = false);

    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);

    if (res.isSuccess) {
      context.read<AuthBloc>().add(AuthRefreshUserRequested());
      navigator.pop();
      messenger.showSnackBar(
        const SnackBar(
          content: Text('Profil dan alamat berhasil diperbarui'),
          backgroundColor: AppTheme.primaryColor,
        ),
      );
    } else {
      messenger.showSnackBar(
        SnackBar(content: Text(res.message), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6FAF6),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        centerTitle: true,
        title: const Text(
          'Edit Profil',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
      ),
      body: _loading
          ? const EditProfileSkeleton()
          : SingleChildScrollView(
              padding: const EdgeInsets.all(UIConstants.paddingL),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(child: _avatarPicker()),
                    const SizedBox(height: UIConstants.spacingXXL),
                    _label('Nama Lengkap'),
                    _field(
                      controller: _nameController,
                      hint: 'Masukkan nama lengkap',
                      icon: Icons.person_outline_rounded,
                      enabled: !_saving,
                      validator: (v) => (v == null || v.trim().length < 3)
                          ? 'Nama minimal 3 karakter'
                          : null,
                    ),
                    const SizedBox(height: UIConstants.spacingXXL),
                    AddressFormSectionWidget(
                      receiverNameController: _receiverNameController,
                      phoneController: _phoneController,
                      addressLineController: _addressLineController,
                      cityController: _cityController,
                      provinceController: _provinceController,
                      postalCodeController: _postalCodeController,
                      notesController: _notesController,
                      enabled: !_saving,
                    ),
                    const SizedBox(height: UIConstants.spacingXXXL),
                    SizedBox(
                      width: double.infinity,
                      height: UIConstants.buttonHeight,
                      child: ElevatedButton(
                        onPressed: _saving ? null : _save,
                        child: _saving
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text(
                                'Simpan Perubahan',
                                style: TextStyle(
                                  fontSize: UIConstants.fontSizeL,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _avatarPicker() {
    return GestureDetector(
      onTap: _saving ? null : _pickImage,
      child: Stack(
        children: [
          Container(
            width: 96,
            height: 96,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.tertiaryColor.withValues(alpha: 0.3),
              border: Border.all(
                color: AppTheme.primaryColor.withValues(alpha: 0.2),
                width: 2,
              ),
            ),
            clipBehavior: Clip.antiAlias,
            child: _buildAvatarContent(),
          ),
          Positioned(
            bottom: 0,
            right: 0,
            child: Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppTheme.primaryColor,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
              child: const Icon(
                Icons.camera_alt_rounded,
                size: 16,
                color: Colors.white,
              ),
            ),
          ),
          if (_uploading)
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.black.withValues(alpha: 0.4),
                ),
                child: const Center(
                  child: SizedBox(
                    width: 28,
                    height: 28,
                    child: CircularProgressIndicator(
                      strokeWidth: 3,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildAvatarContent() {
    if (_pickedFile != null) {
      return Image.file(_pickedFile!, fit: BoxFit.cover);
    }
    if (_avatarUrl.isNotEmpty) {
      return Image.network(
        _avatarUrl,
        fit: BoxFit.cover,
        errorBuilder: (_, _, _) => const Icon(
          Icons.person_rounded,
          size: 48,
          color: AppTheme.primaryColor,
        ),
      );
    }
    return const Icon(
      Icons.person_rounded,
      size: 48,
      color: AppTheme.primaryColor,
    );
  }

  Widget _label(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: UIConstants.spacingXS),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: UIConstants.fontSizeM,
          fontWeight: FontWeight.w600,
          color: Colors.black87,
        ),
      ),
    );
  }

  Widget _field({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    String? Function(String?)? validator,
    TextInputType? keyboardType,
    int maxLines = 1,
    void Function(String)? onChanged,
    bool enabled = true,
  }) {
    return TextFormField(
      controller: controller,
      enabled: enabled,
      validator: validator,
      keyboardType: keyboardType,
      maxLines: maxLines,
      onChanged: onChanged,
      autovalidateMode: AutovalidateMode.onUserInteraction,
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: Icon(icon, size: UIConstants.iconSizeM),
      ),
    );
  }
}
