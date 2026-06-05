import 'package:app/core/constants/ui_constants.dart';
import 'package:app/core/router/app_routes.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/Main/features/chat/chat_service.dart';
import 'package:app/shared/widgets/skeleton/chat_skeleton.dart';
import 'package:flutter/material.dart';

class ChatListScreen extends StatefulWidget {
  final bool showAppBar;

  const ChatListScreen({super.key, this.showAppBar = false});

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  final ChatService _service = ChatService();
  late Future<List<ChatConversationData>> _future;
  String? _error;

  @override
  void initState() {
    super.initState();
    _future = _loadConversations();
  }

  Future<List<ChatConversationData>> _loadConversations() async {
    final response = await _service.getAllShopConversations();
    if (!response.isSuccess) {
      _error = response.message;
      return [];
    }
    _error = null;
    return response.data ?? [];
  }

  Future<void> _refresh() async {
    setState(() {
      _future = _loadConversations();
    });
    await _future;
  }

  void _openConversation(ChatConversationData conversation) {
    final shopId = conversation.shopId;
    if (shopId == null || shopId.isEmpty) return;

    Navigator.pushNamed(
      context,
      AppRoutes.chat,
      arguments: {'shopId': shopId, 'shopName': conversation.title ?? 'Toko'},
    ).then((_) => _refresh());
  }

  @override
  Widget build(BuildContext context) {
    final content = FutureBuilder<List<ChatConversationData>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const ChatListSkeleton();
        }

        final conversations = snapshot.data ?? [];
        if (conversations.isEmpty) {
          return _EmptyChatList(
            message: _error ?? 'Belum ada percakapan toko',
            onRetry: _refresh,
          );
        }

        return RefreshIndicator(
          onRefresh: _refresh,
          child: ListView.separated(
            padding: const EdgeInsets.all(UIConstants.paddingM),
            itemCount: conversations.length,
            separatorBuilder: (context, index) =>
                const SizedBox(height: UIConstants.spacingS),
            itemBuilder: (context, index) {
              final conversation = conversations[index];
              return _ConversationTile(
                conversation: conversation,
                onTap: () => _openConversation(conversation),
              );
            },
          ),
        );
      },
    );

    if (!widget.showAppBar) {
      return content;
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF6FAF6),
      appBar: AppBar(
        title: const Text(
          'Chat Toko',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
      ),
      body: content,
    );
  }
}

class _ConversationTile extends StatelessWidget {
  final ChatConversationData conversation;
  final VoidCallback onTap;

  const _ConversationTile({required this.conversation, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(UIConstants.radiusM),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(UIConstants.radiusM),
        child: Padding(
          padding: const EdgeInsets.all(UIConstants.paddingM),
          child: Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                child: const Icon(
                  Icons.storefront_rounded,
                  color: AppTheme.primaryColor,
                ),
              ),
              const SizedBox(width: UIConstants.spacingM),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      conversation.title ?? 'Toko',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: UIConstants.fontSizeL,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: UIConstants.spacingXS),
                    Text(
                      conversation.lastMessage == null ||
                              conversation.lastMessage!.isEmpty
                          ? 'Mulai percakapan'
                          : conversation.lastMessage!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: UIConstants.fontSizeS,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: UIConstants.spacingS),
              Icon(Icons.chevron_right_rounded, color: Colors.grey[400]),
            ],
          ),
        ),
      ),
    );
  }
}

class _EmptyChatList extends StatelessWidget {
  final String message;
  final Future<void> Function() onRetry;

  const _EmptyChatList({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRetry,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          SizedBox(height: MediaQuery.of(context).size.height * 0.22),
          Icon(
            Icons.chat_bubble_outline_rounded,
            size: 48,
            color: Colors.grey[300],
          ),
          const SizedBox(height: UIConstants.spacingM),
          Text(
            message,
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }
}
