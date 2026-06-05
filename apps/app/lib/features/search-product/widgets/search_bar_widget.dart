import 'package:app/core/constants/ui_constants.dart';
import 'package:flutter/material.dart';

class SearchBarWidget extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String> onSubmitted;

  const SearchBarWidget({
    super.key,
    required this.controller,
    required this.onSubmitted,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      textInputAction: TextInputAction.search,
      onSubmitted: onSubmitted,
      decoration: InputDecoration(
        hintText: 'Cari produk eco...',
        prefixIcon: const Icon(Icons.search),
        suffixIcon: ListenableBuilder(
          listenable: controller,
          builder: (_, _) => controller.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () {
                    controller.clear();
                  },
                )
              : const SizedBox.shrink(),
        ),
        contentPadding: const EdgeInsets.symmetric(
          vertical: UIConstants.paddingM,
          horizontal: UIConstants.paddingM,
        ),
      ),
    );
  }
}
