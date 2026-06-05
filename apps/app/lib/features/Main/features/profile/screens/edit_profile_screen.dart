import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:app/features/auth/presentation/bloc/auth_event.dart';
import 'package:app/shared/domains/dto/update_profile_dto.dart';
import 'package:app/shared/services/me_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _avatarController = TextEditingController();

  bool _loading = true;
  bool _saving = false;
  String _avatarPreview = '';

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
      _nameController.text = p.fullName;
      _phoneController.text = p.phone ?? '';
      _addressController.text = p.address ?? '';
      _avatarController.text = p.avatarUrl ?? '';
      _avatarPreview = p.avatarUrl ?? '';
    }
    setState(() => _loading = false);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _avatarController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);

    final res = await MeService.updateProfile(
      UpdateProfileDto(
        name: _nameController.text.trim(),
        phone: _phoneController.text.trim(),
        address: _addressController.text.trim(),
        avatarUrl: _avatarController.text.trim(),
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
          content: Text('Profil berhasil diperbarui'),
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
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(UIConstants.paddingL),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(child: _avatarCircle()),
                    const SizedBox(height: UIConstants.spacingXXL),
                    _label('Nama Lengkap'),
                    _field(
                      controller: _nameController,
                      hint: 'Masukkan nama lengkap',
                      icon: Icons.person_outline_rounded,
                      validator: (v) => (v == null || v.trim().length < 3)
                          ? 'Nama minimal 3 karakter'
                          : null,
                    ),
                    const SizedBox(height: UIConstants.spacingL),
                    _label('Telepon'),
                    _field(
                      controller: _phoneController,
                      hint: '08xxxxxxxxxx',
                      icon: Icons.phone_outlined,
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: UIConstants.spacingL),
                    _label('Alamat'),
                    _field(
                      controller: _addressController,
                      hint: 'Masukkan alamat',
                      icon: Icons.location_on_outlined,
                      maxLines: 2,
                    ),
                    const SizedBox(height: UIConstants.spacingL),
                    _label('URL Foto Profil'),
                    _field(
                      controller: _avatarController,
                      hint: 'https://...',
                      icon: Icons.image_outlined,
                      keyboardType: TextInputType.url,
                      onChanged: (v) =>
                          setState(() => _avatarPreview = v.trim()),
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

  Widget _avatarCircle() {
    return Container(
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
      child: _avatarPreview.isEmpty
          ? const Icon(
              Icons.person_rounded,
              size: 48,
              color: AppTheme.primaryColor,
            )
          : Image.network(
              _avatarPreview,
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => const Icon(
                Icons.person_rounded,
                size: 48,
                color: AppTheme.primaryColor,
              ),
            ),
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
  }) {
    return TextFormField(
      controller: controller,
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
