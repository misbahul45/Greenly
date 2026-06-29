import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:flutter/material.dart';

class CategoryCard extends StatelessWidget {
  final String id;
  final String name;
  final String? imageUrl;
  final IconData? icon;
  final int? productCount;
  final VoidCallback? onTap;

  const CategoryCard({
    super.key,
    required this.id,
    required this.name,
    this.imageUrl,
    this.icon,
    this.productCount,
    this.onTap,
  });

  IconData _getCategoryIcon(String categoryName) {
    if (icon != null) return icon!;
    
    final lowerName = categoryName.toLowerCase();
    
    if (lowerName.contains('elektronik') || lowerName.contains('electronic') || lowerName.contains('gadget') || lowerName.contains('handphone')) return Icons.devices_rounded;
    if (lowerName.contains('pakaian') || lowerName.contains('fashion') || lowerName.contains('baju') || lowerName.contains('celana') || lowerName.contains('kaos') || lowerName.contains('jaket')) return Icons.checkroom_rounded;
    if (lowerName.contains('makanan') || lowerName.contains('food') || lowerName.contains('kuliner') || lowerName.contains('minuman') || lowerName.contains('snack') || lowerName.contains('kue')) return Icons.restaurant_rounded;
    if (lowerName.contains('olahraga') || lowerName.contains('sport') || lowerName.contains('fitness')) return Icons.sports_basketball_rounded;
    if (lowerName.contains('kecantikan') || lowerName.contains('beauty') || lowerName.contains('skincare') || lowerName.contains('makeup') || lowerName.contains('kosmetik')) return Icons.face_retouching_natural_rounded;
    if (lowerName.contains('kesehatan') || lowerName.contains('health') || lowerName.contains('obat') || lowerName.contains('medis')) return Icons.medical_services_rounded;
    if (lowerName.contains('rumah') || lowerName.contains('home') || lowerName.contains('furniture') || lowerName.contains('mebel') || lowerName.contains('dapur')) return Icons.chair_rounded;
    if (lowerName.contains('otomotif') || lowerName.contains('mobil') || lowerName.contains('motor') || lowerName.contains('kendaraan')) return Icons.directions_car_rounded;
    if (lowerName.contains('buku') || lowerName.contains('book') || lowerName.contains('alat tulis') || lowerName.contains('stationery')) return Icons.menu_book_rounded;
    if (lowerName.contains('mainan') || lowerName.contains('toy') || lowerName.contains('hobi')) return Icons.toys_rounded;
    if (lowerName.contains('bayi') || lowerName.contains('baby') || lowerName.contains('anak') || lowerName.contains('kids')) return Icons.child_friendly_rounded;
    if (lowerName.contains('pertanian') || lowerName.contains('bibit') || lowerName.contains('tanaman') || lowerName.contains('kebun') || lowerName.contains('organik') || lowerName.contains('tani')) return Icons.eco_rounded;
    if (lowerName.contains('tas') || lowerName.contains('bag') || lowerName.contains('koper') || lowerName.contains('ransel')) return Icons.shopping_bag_rounded;
    if (lowerName.contains('sepatu') || lowerName.contains('shoe') || lowerName.contains('sandal')) return Icons.snowshoeing_rounded;
    if (lowerName.contains('perhiasan') || lowerName.contains('jewelry') || lowerName.contains('jam tangan') || lowerName.contains('aksesoris')) return Icons.watch_rounded;
    if (lowerName.contains('komputer') || lowerName.contains('laptop') || lowerName.contains('pc')) return Icons.computer_rounded;
    if (lowerName.contains('kamera') || lowerName.contains('camera') || lowerName.contains('fotografi')) return Icons.camera_alt_rounded;
    if (lowerName.contains('hewan') || lowerName.contains('pet') || lowerName.contains('peliharaan')) return Icons.pets_rounded;
    if (lowerName.contains('musik') || lowerName.contains('music') || lowerName.contains('alat musik')) return Icons.music_note_rounded;
    if (lowerName.contains('tiket') || lowerName.contains('ticket') || lowerName.contains('voucher') || lowerName.contains('travel')) return Icons.local_activity_rounded;
    if (lowerName.contains('groceries') || lowerName.contains('sayur') || lowerName.contains('buah') || lowerName.contains('daging')) return Icons.local_grocery_store_rounded;

    return Icons.category_rounded;
  }

  // Generate a distinct but soft pastel color based on the category name
  Color _getCategoryColor(String name) {
    final colors = [
      const Color(0xFFE8F5E9), // Green
      const Color(0xFFE3F2FD), // Blue
      const Color(0xFFFFF3E0), // Orange
      const Color(0xFFFCE4EC), // Pink
      const Color(0xFFF3E5F5), // Purple
      const Color(0xFFFFF8E1), // Amber
      const Color(0xFFE0F7FA), // Cyan
      const Color(0xFFFBE9E7), // Deep Orange
    ];
    
    int hash = 0;
    for (int i = 0; i < name.length; i++) {
      hash = name.codeUnitAt(i) + ((hash << 5) - hash);
    }
    
    return colors[hash.abs() % colors.length];
  }

  // Generate a slightly darker icon color based on the pastel background
  Color _getIconColor(String name) {
    final colors = [
      const Color(0xFF2E7D32), // Green
      const Color(0xFF1565C0), // Blue
      const Color(0xFFE65100), // Orange
      const Color(0xFFC2185B), // Pink
      const Color(0xFF6A1B9A), // Purple
      const Color(0xFFFF8F00), // Amber
      const Color(0xFF00838F), // Cyan
      const Color(0xFFD84315), // Deep Orange
    ];
    
    int hash = 0;
    for (int i = 0; i < name.length; i++) {
      hash = name.codeUnitAt(i) + ((hash << 5) - hash);
    }
    
    return colors[hash.abs() % colors.length];
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(UIConstants.radiusL),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(UIConstants.radiusL),
        child: Ink(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(UIConstants.radiusL),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          padding: const EdgeInsets.all(UIConstants.paddingM),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _iconBox(),
              const SizedBox(height: UIConstants.spacingM),
              Text(
                name,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: UIConstants.fontSizeS,
                  fontWeight: FontWeight.w700,
                  color: Colors.black87,
                  height: 1.25,
                ),
              ),
              if (productCount != null) ...[
                const SizedBox(height: 4),
                Text(
                  '$productCount produk',
                  style: TextStyle(
                    fontSize: UIConstants.fontSizeXS,
                    fontWeight: FontWeight.w500,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _iconBox() {
    final url = imageUrl?.trim();
    final determinedIcon = _getCategoryIcon(name);
    final bgColor = _getCategoryColor(name);
    final iconColor = _getIconColor(name);

    return Container(
      width: 52,
      height: 52,
      decoration: BoxDecoration(
        color: bgColor,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: iconColor.withValues(alpha: 0.15),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: url != null && url.isNotEmpty
          ? Image.network(
              url,
              fit: BoxFit.cover,
              cacheWidth: 160,
              errorBuilder: (_, _, _) =>
                  Icon(determinedIcon, color: iconColor, size: 26),
            )
          : Icon(determinedIcon, color: iconColor, size: 26),
    );
  }
}
