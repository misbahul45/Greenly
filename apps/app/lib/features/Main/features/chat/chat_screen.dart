import 'dart:async';

import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/core/utils/currency_helper.dart';
import 'package:app/features/Main/features/chat/chat_service.dart';
import 'package:flutter/material.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final ChatService _service = ChatService();
  final TextEditingController _controller = TextEditingController();
  StreamSubscription<ChatRealtimeEvent>? _subscription;
  bool _loading = true;
  bool _sending = false;
  String? _conversationId;
  String? _error;
  List<ChatMessageData> _messages = [];

  @override
  void initState() {
    super.initState();
    _loadChat();
  }

  Future<void> _loadChat() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    final conversations = await _service.getConversations();
    ChatConversationData? conversation;

    if (conversations.isSuccess && (conversations.data?.isNotEmpty ?? false)) {
      conversation = conversations.data!.first;
    } else {
      final created = await _service.createConversation();
      if (created.isSuccess) {
        conversation = created.data;
      }
    }

    if (conversation == null) {
      setState(() {
        _loading = false;
        _error = conversations.message;
      });
      return;
    }

    final messages = await _service.getMessages(conversation.id);

    setState(() {
      _conversationId = conversation!.id;
      _messages = messages.data ?? [];
      _loading = false;
      _error = messages.isSuccess ? null : messages.message;
    });

    _subscribeRealtime(conversation.id);
  }

  Future<void> _sendMessage() async {
    final content = _controller.text.trim();
    final conversationId = _conversationId;
    if (content.isEmpty || conversationId == null || _sending) return;

    _controller.clear();
    setState(() {
      _sending = true;
      _messages = [
        ..._messages,
        ChatMessageData(
          id: DateTime.now().microsecondsSinceEpoch.toString(),
          senderType: 'USER',
          content: content,
          recommendations: const [],
        ),
      ];
    });

    final response = await _service.sendMessage(
      conversationId: conversationId,
      content: content,
    );

    setState(() {
      _sending = false;
      if (response.isSuccess && response.data != null) {
        _messages = _uniqueMessages(response.data!.messages);
      } else {
        _error = response.message;
      }
    });
  }

  void _subscribeRealtime(String conversationId) {
    _subscription?.cancel();
    _subscription = _service.streamMessages(conversationId).listen((event) {
      final message = event.message;
      if (!mounted || message == null) return;

      setState(() {
        _messages = _uniqueMessages([..._messages, message]);
      });
    });
  }

  List<ChatMessageData> _uniqueMessages(List<ChatMessageData> messages) {
    final mapped = <String, ChatMessageData>{};

    for (final message in messages) {
      mapped[message.id] = message;
    }

    return mapped.values.toList();
  }

  @override
  void dispose() {
    _subscription?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null && _messages.isEmpty) {
      return Center(child: Text(_error!));
    }

    return Column(
      children: [
        Expanded(
          child: _messages.isEmpty
              ? const Center(child: Text('Tanyakan produk ramah lingkungan'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) {
                    return _ChatBubble(message: _messages[index]);
                  },
                ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    minLines: 1,
                    maxLines: 4,
                    decoration: InputDecoration(
                      hintText: 'Cari produk eco...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 12,
                      ),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _sending ? null : _sendMessage,
                  icon: _sending
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.send_rounded),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _ChatBubble extends StatelessWidget {
  final ChatMessageData message;

  const _ChatBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final isUser = message.senderType == 'USER';

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.82,
        ),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isUser ? AppTheme.primaryColor : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              message.content,
              style: TextStyle(
                color: isUser ? Colors.white : Colors.black87,
                fontWeight: FontWeight.w500,
              ),
            ),
            if (message.recommendations.isNotEmpty) ...[
              const SizedBox(height: 10),
              ...message.recommendations.map(
                (product) => _RecommendationTile(product: product),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _RecommendationTile extends StatelessWidget {
  final ChatProductRecommendation product;

  const _RecommendationTile({required this.product});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: product.slug == null || product.slug!.isEmpty
          ? null
          : () {
              Navigator.pushNamed(
                context,
                AppRoutes.productDetail,
                arguments: product.slug,
              );
            },
      child: Container(
        margin: const EdgeInsets.only(top: 8),
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: product.imageUrl == null || product.imageUrl!.isEmpty
                  ? Container(
                      width: 48,
                      height: 48,
                      color: Colors.grey.shade100,
                      child: const Icon(Icons.eco, color: AppTheme.primaryColor),
                    )
                  : Image.network(
                      product.imageUrl!,
                      width: 48,
                      height: 48,
                      fit: BoxFit.cover,
                    ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
                  ),
                  if (product.price != null)
                    Text(
                      CurrencyHelper.formatRupiah(product.price!),
                      style: const TextStyle(
                        color: AppTheme.primaryColor,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
