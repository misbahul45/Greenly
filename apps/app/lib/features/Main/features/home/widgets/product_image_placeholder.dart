// product_image_placeholder.dart
import 'package:flutter/material.dart';

class ProductImagePlaceholder extends StatelessWidget {
  const ProductImagePlaceholder({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFFF5F5F5),
      child: Center(
        child: Icon(
          Icons.image_outlined,
          size: 36,
          color: Colors.grey.shade300,
        ),
      ),
    );
  }
}