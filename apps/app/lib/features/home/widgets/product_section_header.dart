import 'package:app/core/constants/ui_constants.dart';
import 'package:flutter/material.dart';

class ProductSectionHeader extends StatelessWidget {
  final int productCount;

  const ProductSectionHeader({super.key, required this.productCount});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        UIConstants.paddingM,
        UIConstants.spacingXL,
        UIConstants.paddingM,
        UIConstants.spacingM,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Produk',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Colors.black87,
                ),
              ),
              Text(
                '$productCount produk ditemukan',
                style: TextStyle(fontSize: 12, color: Colors.grey[500]),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: UIConstants.spacingM,
              vertical: UIConstants.spacingXS,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.grey[200]!),
            ),
            child: Row(
              children: [
                Icon(Icons.tune_rounded, size: 14, color: Colors.grey[600]),
                const SizedBox(width: UIConstants.spacingXS),
                Text(
                  'Filter',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
