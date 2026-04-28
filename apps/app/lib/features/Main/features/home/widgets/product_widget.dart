import 'package:app/shared/widgets/section_title.dart';
import 'package:flutter/material.dart';

class ProductWidget extends StatelessWidget {
  const ProductWidget({super.key});

  final List<Map<String, dynamic>> products = const [
    {
      "name": "Reusable Bottle",
      "price": "\$12",
      "icon": Icons.local_drink_outlined,
    },
    {
      "name": "Eco Bag",
      "price": "\$8",
      "icon": Icons.shopping_bag_outlined,
    },
    {
      "name": "Bamboo Chair",
      "price": "\$45",
      "icon": Icons.chair_outlined,
    },
    {
      "name": "Solar Lamp",
      "price": "\$25",
      "icon": Icons.lightbulb_outline,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionTitle(title: "Products"),
        const SizedBox(height: 12),

        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: products.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 14,
            mainAxisSpacing: 14,
            childAspectRatio: 0.82,
          ),
          itemBuilder: (context, index) {
            final item = products[index];

            return Container(
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(18),
              ),
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Center(
                      child: Icon(
                        item["icon"],
                        size: 54,
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    item["name"],
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    item["price"],
                    style: const TextStyle(
                      color: Colors.green,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}
