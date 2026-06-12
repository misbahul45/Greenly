import 'package:flutter/material.dart';

class SearchHistoryWidget extends StatelessWidget {
  final List<String> history;
  final ValueChanged<String> onTap;
  final ValueChanged<String> onRemove;
  final VoidCallback onClearAll;

  const SearchHistoryWidget({
    super.key,
    required this.history,
    required this.onTap,
    required this.onRemove,
    required this.onClearAll,
  });

  @override
  Widget build(BuildContext context) {
    if (history.isEmpty) {
      return const Center(
        child: Text('Belum ada riwayat pencarian'),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Pencarian Terakhir',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
              ),
              TextButton(
                onPressed: onClearAll,
                child: const Text('Hapus Semua'),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: history.length,
            itemBuilder: (_, index) {
              final item = history[index];
              return ListTile(
                leading: const Icon(Icons.history, size: 20),
                title: Text(item, style: const TextStyle(fontSize: 14)),
                trailing: IconButton(
                  icon: const Icon(Icons.close, size: 18),
                  onPressed: () => onRemove(item),
                ),
                onTap: () => onTap(item),
              );
            },
          ),
        ),
      ],
    );
  }
}
