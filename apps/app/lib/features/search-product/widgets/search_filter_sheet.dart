import 'package:Greenly/core/constants/ui_constants.dart';
import 'package:Greenly/core/theme/app_theme.dart';
import 'package:Greenly/features/Main/features/home/domains/data/category_data.dart';
import 'package:Greenly/features/search-product/domain/dto/search_product_filter.dart';
import 'package:flutter/material.dart';

class SearchFilterSheet extends StatefulWidget {
  final SearchProductFilter current;
  final List<CategoryData> categories;

  const SearchFilterSheet({
    super.key,
    required this.current,
    this.categories = const [],
  });

  @override
  State<SearchFilterSheet> createState() => _SearchFilterSheetState();
}

class _SearchFilterSheetState extends State<SearchFilterSheet> {
  late final TextEditingController _minPriceCtrl;
  late final TextEditingController _maxPriceCtrl;
  late double _ecoScore;
  bool _ecoScoreEnabled = false;
  String? _selectedCategoryId;

  @override
  void initState() {
    super.initState();
    _minPriceCtrl = TextEditingController(
      text: widget.current.minPrice?.toInt().toString() ?? '',
    );
    _maxPriceCtrl = TextEditingController(
      text: widget.current.maxPrice?.toInt().toString() ?? '',
    );
    _ecoScore = widget.current.minEcoScore ?? 70;
    _ecoScoreEnabled = widget.current.minEcoScore != null;
    _selectedCategoryId = widget.current.categoryId;
  }

  @override
  void dispose() {
    _minPriceCtrl.dispose();
    _maxPriceCtrl.dispose();
    super.dispose();
  }

  void _apply() {
    final minPrice = double.tryParse(_minPriceCtrl.text.trim());
    final maxPrice = double.tryParse(_maxPriceCtrl.text.trim());

    if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Harga minimum tidak boleh lebih besar dari harga maksimum',
          ),
        ),
      );
      return;
    }

    Navigator.of(context).pop(
      SearchProductFilter(
        categoryId: _selectedCategoryId,
        minPrice: minPrice,
        maxPrice: maxPrice,
        minEcoScore: _ecoScoreEnabled ? _ecoScore : null,
      ),
    );
  }

  void _reset() {
    Navigator.of(context).pop(const SearchProductFilter());
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(UIConstants.paddingL),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Filter Pencarian',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                ),
                TextButton(onPressed: _reset, child: const Text('Reset')),
              ],
            ),
            if (widget.categories.isNotEmpty) ...[
              const SizedBox(height: UIConstants.spacingL),
              const Text(
                'Kategori',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              ),
              const SizedBox(height: UIConstants.spacingS),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _CategoryChip(
                      label: 'Semua',
                      selected: _selectedCategoryId == null,
                      onTap: () => setState(() => _selectedCategoryId = null),
                    ),
                    ...widget.categories.map(
                      (cat) => _CategoryChip(
                        label: cat.name,
                        selected: _selectedCategoryId == cat.id,
                        onTap: () =>
                            setState(() => _selectedCategoryId = cat.id),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: UIConstants.spacingL),
            const Text(
              'Rentang Harga',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
            ),
            const SizedBox(height: UIConstants.spacingS),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _minPriceCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      hintText: 'Min',
                      prefixText: 'Rp ',
                    ),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: UIConstants.spacingS,
                  ),
                  child: Text('–'),
                ),
                Expanded(
                  child: TextField(
                    controller: _maxPriceCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      hintText: 'Maks',
                      prefixText: 'Rp ',
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: UIConstants.spacingXXL),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Skor Eco Minimum',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                ),
                Switch(
                  value: _ecoScoreEnabled,
                  activeThumbColor: AppTheme.primaryColor,
                  onChanged: (v) => setState(() => _ecoScoreEnabled = v),
                ),
              ],
            ),
            if (_ecoScoreEnabled) ...[
              Row(
                children: [
                  Expanded(
                    child: Slider(
                      value: _ecoScore,
                      min: 0,
                      max: 100,
                      divisions: 20,
                      activeColor: AppTheme.primaryColor,
                      label: _ecoScore.toInt().toString(),
                      onChanged: (v) => setState(() => _ecoScore = v),
                    ),
                  ),
                  SizedBox(
                    width: 36,
                    child: Text(
                      _ecoScore.toInt().toString(),
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: UIConstants.spacingXXL),
            SizedBox(
              width: double.infinity,
              height: UIConstants.buttonHeight,
              child: ElevatedButton(
                onPressed: _apply,
                child: const Text('Terapkan Filter'),
              ),
            ),
            const SizedBox(height: UIConstants.spacingM),
          ],
        ),
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _CategoryChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: UIConstants.spacingS),
        padding: const EdgeInsets.symmetric(
          horizontal: UIConstants.paddingM,
          vertical: UIConstants.spacingXS,
        ),
        decoration: BoxDecoration(
          color: selected
              ? AppTheme.primaryColor
              : AppTheme.primaryColor.withValues(alpha: 0.07),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: selected
                ? AppTheme.primaryColor
                : AppTheme.primaryColor.withValues(alpha: 0.2),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: UIConstants.fontSizeS,
            fontWeight: FontWeight.w600,
            color: selected ? Colors.white : AppTheme.primaryColor,
          ),
        ),
      ),
    );
  }
}
