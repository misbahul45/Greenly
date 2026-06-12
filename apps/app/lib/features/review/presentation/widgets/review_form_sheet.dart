import 'package:app/core/constants/ui_constants.dart';
import 'package:app/features/product-detail/domains/data/review_data.dart';
import 'package:app/features/review/domain/dto/review_dto.dart';
import 'package:app/features/review/service/review_service.dart';
import 'package:flutter/material.dart';

class ReviewFormSheet extends StatefulWidget {
  final String productId;
  final String? orderId;
  final String? productName;
  final ReviewData? existing;

  const ReviewFormSheet({
    super.key,
    required this.productId,
    this.orderId,
    this.productName,
    this.existing,
  });

  /// Returns `true` when a review was created/updated.
  static Future<bool?> show(
    BuildContext context, {
    required String productId,
    String? orderId,
    String? productName,
    ReviewData? existing,
  }) {
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => ReviewFormSheet(
        productId: productId,
        orderId: orderId,
        productName: productName,
        existing: existing,
      ),
    );
  }

  @override
  State<ReviewFormSheet> createState() => _ReviewFormSheetState();
}

class _ReviewFormSheetState extends State<ReviewFormSheet> {
  final _formKey = GlobalKey<FormState>();
  final _service = ReviewService();
  late final TextEditingController _titleController;
  late final TextEditingController _commentController;
  late int _rating;
  bool _saving = false;

  bool get _isEdit => widget.existing != null;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(
      text: widget.existing?.title ?? '',
    );
    _commentController = TextEditingController(
      text: widget.existing?.comment ?? '',
    );
    _rating = widget.existing?.rating ?? 5;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);

    final res = _isEdit
        ? await _service.update(
            widget.existing!.id,
            UpdateReviewDto(
              rating: _rating,
              title: _titleController.text.trim(),
              comment: _commentController.text.trim(),
            ),
          )
        : await _service.create(
            CreateReviewDto(
              productId: widget.productId,
              rating: _rating,
              title: _titleController.text.trim(),
              comment: _commentController.text.trim(),
              orderId: widget.orderId,
            ),
          );

    if (!mounted) return;
    setState(() => _saving = false);

    if (res.isSuccess) {
      Navigator.pop(context, true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(res.message), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: UIConstants.paddingL,
        right: UIConstants.paddingL,
        top: UIConstants.paddingL,
        bottom: MediaQuery.of(context).viewInsets.bottom + UIConstants.paddingL,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: UIConstants.spacingL),
            Text(
              _isEdit ? 'Edit Ulasan' : 'Tulis Ulasan',
              style: const TextStyle(
                fontSize: UIConstants.fontSizeXL,
                fontWeight: FontWeight.w800,
              ),
            ),
            if (widget.productName != null &&
                widget.productName!.isNotEmpty) ...[
              const SizedBox(height: UIConstants.spacingXS),
              Text(
                widget.productName!,
                style: TextStyle(
                  fontSize: UIConstants.fontSizeM,
                  color: Colors.grey[600],
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            const SizedBox(height: UIConstants.spacingL),
            Center(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (i) {
                  final value = i + 1;
                  return IconButton(
                    onPressed: _saving
                        ? null
                        : () => setState(() => _rating = value),
                    icon: Icon(
                      value <= _rating
                          ? Icons.star_rounded
                          : Icons.star_outline_rounded,
                      size: 36,
                      color: const Color(0xFFFFC107),
                    ),
                  );
                }),
              ),
            ),
            const SizedBox(height: UIConstants.spacingM),
            TextFormField(
              controller: _titleController,
              enabled: !_saving,
              decoration: const InputDecoration(hintText: 'Judul ulasan'),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Judul wajib diisi' : null,
            ),
            const SizedBox(height: UIConstants.spacingM),
            TextFormField(
              controller: _commentController,
              enabled: !_saving,
              maxLines: 4,
              decoration: const InputDecoration(
                hintText: 'Bagikan pengalamanmu...',
              ),
              validator: (v) => (v == null || v.trim().length < 3)
                  ? 'Ulasan minimal 3 karakter'
                  : null,
            ),
            const SizedBox(height: UIConstants.spacingL),
            SizedBox(
              width: double.infinity,
              height: UIConstants.buttonHeight,
              child: ElevatedButton(
                onPressed: _saving ? null : _submit,
                child: _saving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : Text(
                        _isEdit ? 'Simpan' : 'Kirim Ulasan',
                        style: const TextStyle(
                          fontSize: UIConstants.fontSizeL,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
