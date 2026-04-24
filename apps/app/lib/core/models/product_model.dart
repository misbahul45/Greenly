class EcoAttribute {
  final double carbonFootprint;
  final bool recyclable;
  final String materialType;
  final double ecoScore;

  const EcoAttribute({
    required this.carbonFootprint,
    required this.recyclable,
    required this.materialType,
    required this.ecoScore,
  });
}

class ProductPrice {
  final double amount;
  final String currency;

  const ProductPrice({required this.amount, required this.currency});

  String get formatted {
    if (currency == 'IDR') {
      final f = amount
          .toStringAsFixed(0)
          .replaceAllMapped(
            RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
            (m) => '${m[1]}.',
          );
      return 'Rp $f';
    }
    return '\$${amount.toStringAsFixed(2)}';
  }
}

class ProductInventory {
  final int stock;
  final int reservedStock;

  const ProductInventory({required this.stock, required this.reservedStock});

  int get available => stock - reservedStock;
}

class ProductDiscount {
  final String name;
  final double percentage;
  final bool isActive;

  const ProductDiscount({
    required this.name,
    required this.percentage,
    required this.isActive,
  });
}

class ProductModel {
  final String id;
  final String shopId;
  final String categoryId;
  final String name;
  final String slug;
  final String description;
  final String sku;
  final int favoriteCount;
  final int reviewCount;
  final double ratingAverage;
  final bool isActive;
  final String imageUrl;
  final ProductPrice price;
  final ProductInventory inventory;
  final EcoAttribute? ecoAttribute;
  final ProductDiscount? discount;

  const ProductModel({
    required this.id,
    required this.shopId,
    required this.categoryId,
    required this.name,
    required this.slug,
    required this.description,
    required this.sku,
    required this.favoriteCount,
    required this.reviewCount,
    required this.ratingAverage,
    required this.isActive,
    required this.imageUrl,
    required this.price,
    required this.inventory,
    this.ecoAttribute,
    this.discount,
  });

  double get finalPrice {
    if (discount != null && discount!.isActive) {
      return price.amount * (1 - discount!.percentage / 100);
    }
    return price.amount;
  }
}
