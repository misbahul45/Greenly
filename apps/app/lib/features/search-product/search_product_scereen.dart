import 'package:flutter/material.dart';

class SearchProductScreen extends StatefulWidget {
  const SearchProductScreen({super.key});

  @override
  State<SearchProductScreen> createState() => _SearchProductScreenState();
}

class _SearchProductScreenState extends State<SearchProductScreen> {
  final TextEditingController _controller = TextEditingController();

  List<String> searchHistory = [];

  void _addSearch(String query) {
    if (query.trim().isEmpty) return;

    setState(() {
      searchHistory.remove(query);
      searchHistory.insert(0, query);
    });
  }

  void _removeSearch(String query) {
    setState(() {
      searchHistory.remove(query);
    });
  }

  void _clearAll() {
    setState(() {
      searchHistory.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Search Product"),
        elevation: 0,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _controller,
              onSubmitted: (value) {
                _addSearch(value);
              },
              decoration: InputDecoration(
                hintText: "Search product...",
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _controller.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () {
                          _controller.clear();
                          setState(() {});
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (_) {
                setState(() {});
              },
            ),
          ),

          // 📜 History Header
          if (searchHistory.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "Recent Searches",
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  TextButton(
                    onPressed: _clearAll,
                    child: const Text("Clear All"),
                  )
                ],
              ),
            ),

          // 📜 History List
          Expanded(
            child: searchHistory.isEmpty
                ? const Center(child: Text("No recent searches"))
                : ListView.builder(
                    itemCount: searchHistory.length,
                    itemBuilder: (context, index) {
                      final item = searchHistory[index];

                      return ListTile(
                        leading: const Icon(Icons.history),
                        title: Text(item),
                        trailing: IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => _removeSearch(item),
                        ),
                        onTap: () {
                          _controller.text = item;
                          _controller.selection = TextSelection.fromPosition(
                            TextPosition(offset: item.length),
                          );
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}