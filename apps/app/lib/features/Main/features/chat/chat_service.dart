import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';

class ChatService {
  static String get _base => '${ENV.coreApiUrl}/chat';

  Future<ApiResponse<List<ChatConversationData>>> getAllShopConversations() {
    return ApiClient.get(
      '$_base/conversations',
      query: {'page': 1, 'limit': 50, 'type': 'SHOP'},
      fromJsonT: ChatConversationData.listFromJson,
    );
  }

  Future<ApiResponse<List<ChatConversationData>>> getShopConversations({
    required String shopId,
  }) {
    return ApiClient.get(
      '$_base/conversations',
      query: {'page': 1, 'limit': 20, 'type': 'SHOP', 'shopId': shopId},
      fromJsonT: ChatConversationData.listFromJson,
    );
  }

  Future<ApiResponse<ChatConversationData>> createShopConversation({
    required String shopId,
    required String shopName,
    String? productId,
    String? productName,
  }) {
    final metadata = <String, dynamic>{};

    if (productId != null && productId.isNotEmpty) {
      metadata['productId'] = productId;
    }

    if (productName != null && productName.isNotEmpty) {
      metadata['productName'] = productName;
    }

    return ApiClient.post(
      '$_base/conversations',
      {
        'type': 'SHOP',
        'shopId': shopId,
        'title': shopName,
        'metadata': metadata,
      },
      fromJsonT: (json) => ChatConversationData.fromJson(json),
    );
  }

  Future<ApiResponse<List<ChatMessageData>>> getMessages(
    String conversationId,
  ) {
    return ApiClient.get(
      '$_base/conversations/$conversationId/messages',
      query: {'page': 1, 'limit': 50},
      fromJsonT: ChatMessageData.listFromJson,
    );
  }

  Future<ApiResponse<ChatSendResponse>> sendMessage(
    String conversationId,
    String content,
  ) {
    return ApiClient.post(
      '$_base/conversations/$conversationId/messages',
      {'content': content},
      fromJsonT: (json) => ChatSendResponse.fromJson(json),
    );
  }

  Stream<ChatRealtimeEvent> streamMessages(String conversationId) {
    return ApiClient.stream(
      '$_base/conversations/$conversationId/stream',
      fromJsonT: (json) =>
          ChatRealtimeEvent.fromJson(json is Map<String, dynamic> ? json : {}),
    );
  }
}

class ChatRealtimeEvent {
  final String type;
  final ChatMessageData? message;

  ChatRealtimeEvent({required this.type, this.message});

  factory ChatRealtimeEvent.fromJson(Map<String, dynamic> json) {
    final message = json['message'];

    return ChatRealtimeEvent(
      type: json['type']?.toString() ?? '',
      message: message is Map<String, dynamic>
          ? ChatMessageData.fromJson(message)
          : null,
    );
  }
}

class ChatConversationData {
  final String id;
  final String type;
  final String? title;
  final String? shopId;
  final String? buyerId;
  final Map<String, dynamic>? metadata;
  final String? lastMessage;
  final DateTime? lastMessageAt;

  ChatConversationData({
    required this.id,
    required this.type,
    this.title,
    this.shopId,
    this.buyerId,
    this.metadata,
    this.lastMessage,
    this.lastMessageAt,
  });

  factory ChatConversationData.fromJson(Map<String, dynamic> json) {
    return ChatConversationData(
      id: json['id']?.toString() ?? '',
      type: json['type']?.toString() ?? '',
      title: json['title']?.toString(),
      shopId: json['shopId']?.toString(),
      buyerId: json['buyerId']?.toString(),
      metadata: _mapFromJson(json['metadata']),
      lastMessage: json['lastMessage']?.toString(),
      lastMessageAt: DateTime.tryParse(json['lastMessageAt']?.toString() ?? ''),
    );
  }

  static List<ChatConversationData> listFromJson(dynamic json) {
    final items = json is List ? json : const [];
    return items
        .whereType<Map<String, dynamic>>()
        .map(ChatConversationData.fromJson)
        .where((item) => item.id.isNotEmpty)
        .toList();
  }
}

class ChatMessageData {
  final String id;
  final String conversationId;
  final String? senderId;
  final String senderType;
  final String content;
  final DateTime? createdAt;

  ChatMessageData({
    required this.id,
    this.conversationId = '',
    this.senderId,
    required this.senderType,
    required this.content,
    this.createdAt,
  });

  factory ChatMessageData.fromJson(Map<String, dynamic> json) {
    return ChatMessageData(
      id: json['id']?.toString() ?? '',
      conversationId: json['conversationId']?.toString() ?? '',
      senderId: json['senderId']?.toString(),
      senderType: json['senderType']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
    );
  }

  static List<ChatMessageData> listFromJson(dynamic json) {
    final items = json is List ? json : const [];
    return items
        .whereType<Map<String, dynamic>>()
        .map(ChatMessageData.fromJson)
        .where((item) => item.id.isNotEmpty)
        .toList();
  }
}

class ChatSendResponse {
  final ChatConversationData conversation;
  final List<ChatMessageData> messages;

  ChatSendResponse({required this.conversation, required this.messages});

  factory ChatSendResponse.fromJson(Map<String, dynamic> json) {
    return ChatSendResponse(
      conversation: ChatConversationData.fromJson(
        json['conversation'] is Map<String, dynamic>
            ? json['conversation']
            : {},
      ),
      messages: ChatMessageData.listFromJson(json['messages']),
    );
  }
}

Map<String, dynamic>? _mapFromJson(dynamic value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) {
    return value.map((key, value) => MapEntry(key.toString(), value));
  }
  return null;
}
