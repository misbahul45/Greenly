
import 'package:app/shared/widgets/section_title.dart';
import 'package:flutter/material.dart';

class CategoriesWidget extends StatelessWidget {
  const CategoriesWidget({super.key});

  final List<Map<String, dynamic>> categories = const [
    {"icon": Icons.eco_outlined, "label": "Eco"},
    {"icon": Icons.local_drink_outlined, "label": "Drink"},
    {"icon": Icons.chair_outlined, "label": "Home"},
    {"icon": Icons.checkroom_outlined, "label": "Fashion"},
    {"icon": Icons.devices_outlined, "label": "Tech"},
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionTitle(title: "Categories"),
        const SizedBox(height: 12),

        SizedBox(
          height: 92,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final item = categories[index];

              return Container(
                width: 78,
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(16),
                ),
                padding: const EdgeInsets.all(10),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(item["icon"], size: 28),
                    const SizedBox(height: 8),
                    Text(
                      item["label"],
                      style: const TextStyle(fontSize: 12),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}