import 'dart:async';

import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/Main/features/chat/chat_service.dart';
import 'package:app/shared/widgets/skeleton/chat_skeleton.dart';
import 'package:flutter/material.dart';

class ChatScreen extends StatefulWidget {
  final String shopId;
  final String shopName;
  final String? shopAvatarUrl;
  final String? productId;
  final String? productName;
  final String? productImageUrl;
  final String? productSlug;

  const ChatScreen({
    super.key,
    required this.shopId,
    required this.shopName,
    this.shopAvatarUrl,
    this.productId,
    this.productName,
    this.productImageUrl,
    this.productSlug,
  }) : assert(shopId != '');

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

    final conversations = await _service.getShopConversations(
      shopId: widget.shopId,
    );

    ChatConversationData? conversation;
    if (conversations.isSuccess && (conversations.data?.isNotEmpty ?? false)) {
      conversation = conversations.data!.first;
    } else if (conversations.isSuccess) {
      final created = await _service.createShopConversation(
        shopId: widget.shopId,
        shopName: widget.shopName,
        productId: widget.productId,
        productName: widget.productName,
      );
      if (created.isSuccess) {
        conversation = created.data;
      } else if (mounted) {
        setState(() {
          _loading = false;
          _error = created.message;
        });
        return;
      }
    }

    if (conversation == null) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = conversations.message;
      });
      return;
    }

    final messages = await _service.getMessages(conversation.id);
    if (!mounted) return;

    setState(() {
      _conversationId = conversation!.id;
      _messages = _uniqueMessages(messages.data ?? []);
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
    final optimisticMessage = ChatMessageData(
      id: 'local-${DateTime.now().microsecondsSinceEpoch}',
      senderType: 'USER',
      content: content,
      createdAt: DateTime.now(),
    );

    setState(() {
      _sending = true;
      _messages = _uniqueMessages([..._messages, optimisticMessage]);
    });

    final response = await _service.sendMessage(conversationId, content);
    if (!mounted) return;

    setState(() {
      _sending = false;
      if (response.isSuccess && response.data != null) {
        _messages = _uniqueMessages(response.data!.messages);
        _error = null;
      } else {
        _messages = _messages
            .where((message) => message.id != optimisticMessage.id)
            .toList();
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

    final result = mapped.values.toList();
    result.sort((a, b) {
      final aDate = a.createdAt;
      final bDate = b.createdAt;
      if (aDate == null && bDate == null) return 0;
      if (aDate == null) return -1;
      if (bDate == null) return 1;
      return aDate.compareTo(bDate);
    });
    return result;
  }

  @override
  void dispose() {
    _subscription?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _openShopDetail() {
    Navigator.pushNamed(
      context,
      AppRoutes.shopDetail,
      arguments: {'shopId': widget.shopId},
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6FAF6),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        titleSpacing: 0,
        title: InkWell(
          onTap: _openShopDetail,
          child: Row(
            children: [
              _ShopAvatar(imageUrl: widget.shopAvatarUrl, radius: 18),
              const SizedBox(width: UIConstants.spacingS),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      widget.shopName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: UIConstants.fontSizeL,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    Text(
                      'Toko',
                      style: TextStyle(
                        fontSize: UIConstants.fontSizeXS,
                        color: Colors.grey[600],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return ChatSkeleton(showProductContext: _hasProductContext);
    }

    if (_error != null && _messages.isEmpty) {
      return _ErrorState(message: _error!, onRetry: _loadChat);
    }

    return Column(
      children: [
        if (_hasProductContext)
          _ProductContextCard(
            productName: widget.productName,
            productImageUrl: widget.productImageUrl,
            productSlug: widget.productSlug,
          ),
        if (_error != null)
          Padding(
            padding: const EdgeInsets.fromLTRB(
              UIConstants.paddingM,
              UIConstants.spacingS,
              UIConstants.paddingM,
              0,
            ),
            child: Text(
              _error!,
              style: const TextStyle(
                color: Colors.red,
                fontSize: UIConstants.fontSizeS,
              ),
            ),
          ),
        Expanded(
          child: _messages.isEmpty
              ? Center(
                  child: Text(
                    'Belum ada pesan',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(UIConstants.paddingM),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) {
                    return _ChatBubble(message: _messages[index]);
                  },
                ),
        ),
        SafeArea(
          top: false,
          child: Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(
              UIConstants.paddingM,
              UIConstants.spacingS,
              UIConstants.paddingM,
              UIConstants.spacingM,
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    minLines: 1,
                    maxLines: 4,
                    textInputAction: TextInputAction.send,
                    decoration: const InputDecoration(
                      hintText: 'Tulis pesan ke toko',
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: UIConstants.paddingM,
                        vertical: UIConstants.spacingM,
                      ),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: UIConstants.spacingS),
                IconButton.filled(
                  onPressed: _sending ? null : _sendMessage,
                  icon: _sending
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
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

  bool get _hasProductContext {
    return widget.productId != null && widget.productId!.isNotEmpty;
  }
}

class _ChatBubble extends StatelessWidget {
  final ChatMessageData message;

  const _ChatBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final senderType = message.senderType.toUpperCase();
    final isUser = senderType == 'USER' || senderType == 'BUYER';
    final isSystem = senderType == 'SYSTEM';

    if (isSystem) {
      return Center(
        child: Container(
          margin: const EdgeInsets.only(bottom: UIConstants.spacingM),
          padding: const EdgeInsets.symmetric(
            horizontal: UIConstants.paddingM,
            vertical: UIConstants.spacingS,
          ),
          decoration: BoxDecoration(
            color: Colors.grey.shade200,
            borderRadius: BorderRadius.circular(UIConstants.radiusL),
          ),
          child: Text(
            message.content,
            style: TextStyle(
              color: Colors.grey[700],
              fontSize: UIConstants.fontSizeS,
            ),
          ),
        ),
      );
    }

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: UIConstants.spacingM),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.78,
        ),
        padding: const EdgeInsets.all(UIConstants.paddingM),
        decoration: BoxDecoration(
          color: isUser ? AppTheme.primaryColor : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(UIConstants.radiusM),
            topRight: const Radius.circular(UIConstants.radiusM),
            bottomLeft: Radius.circular(
              isUser ? UIConstants.radiusM : UIConstants.radiusS,
            ),
            bottomRight: Radius.circular(
              isUser ? UIConstants.radiusS : UIConstants.radiusM,
            ),
          ),
          border: isUser ? null : Border.all(color: Colors.grey.shade200),
        ),
        child: Text(
          message.content,
          style: TextStyle(
            color: isUser ? Colors.white : Colors.black87,
            fontSize: UIConstants.fontSizeM,
            height: 1.35,
          ),
        ),
      ),
    );
  }
}

class _ProductContextCard extends StatelessWidget {
  final String? productName;
  final String? productImageUrl;
  final String? productSlug;

  const _ProductContextCard({
    required this.productName,
    required this.productImageUrl,
    required this.productSlug,
  });

  @override
  Widget build(BuildContext context) {
    final canOpenProduct = productSlug != null && productSlug!.isNotEmpty;

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(UIConstants.paddingM),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(UIConstants.radiusS),
            child: productImageUrl == null || productImageUrl!.isEmpty
                ? Container(
                    width: 56,
                    height: 56,
                    color: Colors.grey.shade100,
                    child: const Icon(
                      Icons.inventory_2_outlined,
                      color: AppTheme.primaryColor,
                    ),
                  )
                : Image.network(
                    productImageUrl!,
                    width: 56,
                    height: 56,
                    fit: BoxFit.cover,
                  ),
          ),
          const SizedBox(width: UIConstants.spacingM),
          Expanded(
            child: Text(
              productName == null || productName!.isEmpty
                  ? 'Produk terkait'
                  : productName!,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: UIConstants.fontSizeM,
              ),
            ),
          ),
          const SizedBox(width: UIConstants.spacingS),
          OutlinedButton(
            onPressed: canOpenProduct
                ? () => Navigator.pushNamed(
                    context,
                    AppRoutes.productDetail,
                    arguments: productSlug,
                  )
                : null,
            child: const Text('Lihat Produk'),
          ),
        ],
      ),
    );
  }
}

class _ShopAvatar extends StatelessWidget {
  final String? imageUrl;
  final double radius;

  const _ShopAvatar({required this.imageUrl, required this.radius});

  @override
  Widget build(BuildContext context) {
    if (imageUrl != null && imageUrl!.isNotEmpty) {
      return CircleAvatar(
        radius: radius,
        backgroundImage: NetworkImage(imageUrl!),
        backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
      );
    }

    return CircleAvatar(
      radius: radius,
      backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
      child: Icon(
        Icons.storefront_rounded,
        color: AppTheme.primaryColor,
        size: radius,
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(UIConstants.paddingL),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[700]),
            ),
            const SizedBox(height: UIConstants.spacingM),
            ElevatedButton(onPressed: onRetry, child: const Text('Coba Lagi')),
          ],
        ),
      ),
    );
  }
}
