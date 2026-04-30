import 'package:flutter/material.dart';

class ProductItemLoading extends StatelessWidget {
  const ProductItemLoading({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey.shade300,
        borderRadius: BorderRadius.circular(18),
      ),
    );
  }
}