import 'package:flutter/material.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/onboarding/presentation/widgets/interest_chip_widget.dart';

class InterestScreen extends StatefulWidget {
  final List<String> selectedCategories;
  final List<String> selectedEcoGoals;
  final VoidCallback onNext;

  const InterestScreen({
    super.key,
    required this.selectedCategories,
    required this.selectedEcoGoals,
    required this.onNext,
  });

  @override
  State<InterestScreen> createState() => _InterestScreenState();
}

class _InterestScreenState extends State<InterestScreen> {
  static const _categories = [
    ('cat-2', 'Organic', '🌱'),
    ('cat-3', 'Skincare', '✨'),
    ('cat-4', 'Fashion', '👕'),
    ('cat-5', 'Home', '🏠'),
    ('cat-6', 'Food', '🥗'),
    ('cat-7', 'Drinks', '🫖'),
    ('cat-8', 'Electronics', '⚡'),
    ('cat-9', 'Baby & Kids', '👶'),
    ('cat-10', 'Pets', '🐾'),
    ('cat-11', 'Garden', '🌻'),
  ];

  static const _ecoGoals = [
    ('goal-1', 'Kurangi Plastik', '🌊'),
    ('goal-2', 'Beli Daur Ulang', '♻'),
    ('goal-3', 'Zero Waste', '🌿'),
    ('goal-4', 'Carbon Neutral', '🌍'),
    ('goal-5', 'Cruelty Free', '🐾'),
    ('goal-6', 'Hemat Air', '💧'),
    ('goal-7', 'Energi Bersih', '☀'),
    ('goal-8', 'Lindungi Alam', '🌲'),
  ];

  void _toggleCategory(String id) {
    setState(() {
      if (widget.selectedCategories.contains(id)) {
        widget.selectedCategories.remove(id);
      } else {
        widget.selectedCategories.add(id);
      }
    });
  }

  void _toggleGoal(String id) {
    setState(() {
      if (widget.selectedEcoGoals.contains(id)) {
        widget.selectedEcoGoals.remove(id);
      } else {
        widget.selectedEcoGoals.add(id);
      }
    });
  }

  void _handleNext() {
    if (widget.selectedCategories.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Pilih minimal 1 kategori produk'),
          backgroundColor: AppTheme.primaryColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          margin: const EdgeInsets.all(16),
        ),
      );
      return;
    }
    widget.onNext();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(24, 32, 24, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Ceritakan minatmu',
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        color: Colors.black87,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Kami akan menyesuaikan produk eco-friendly untukmu',
                      style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 28),
                    Row(
                      children: [
                        const Text(
                          'Kategori Produk',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: widget.selectedCategories.isEmpty
                                ? Colors.grey[100]
                                : AppTheme.tertiaryColor.withOpacity(0.4),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            '${widget.selectedCategories.length} dipilih',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: widget.selectedCategories.isEmpty
                                  ? Colors.grey[500]
                                  : AppTheme.primaryColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _categories
                          .map(
                            (c) => InterestChipWidget(
                              emoji: c.$3,
                              label: c.$2,
                              isSelected: widget.selectedCategories.contains(
                                c.$1,
                              ),
                              onTap: () => _toggleCategory(c.$1),
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: 28),
                    const Text(
                      'Tujuan Eco-mu',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Opsional — pilih satu atau lebih',
                      style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _ecoGoals
                          .map(
                            (g) => InterestChipWidget(
                              emoji: g.$3,
                              label: g.$2,
                              isSelected: widget.selectedEcoGoals.contains(
                                g.$1,
                              ),
                              onTap: () => _toggleGoal(g.$1),
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 28),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _handleNext,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: widget.selectedCategories.isEmpty
                        ? Colors.grey[300]
                        : AppTheme.primaryColor,
                    foregroundColor: widget.selectedCategories.isEmpty
                        ? Colors.grey[500]
                        : Colors.white,
                  ),
                  child: const Text(
                    'Lanjutkan',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
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
