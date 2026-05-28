import 'package:app/core/config/env.dart';
import 'package:app/core/utils/api_client.dart';
import 'package:app/core/utils/api_response.dart';

class ChatService {
  static String get _base => '${ENV.API}/core/chat';

  Future<ApiResponse<ChatConversationData>> createConversation() {
    return ApiClient.post(
      '$_base/conversations',
      {
        'type': 'ASSISTANT',
        'title': 'Greenly Assistant',
      },
      fromJsonT: (json) => ChatConversationData.fromJson(json),
    );
  }

  Future<ApiResponse<List<ChatConversationData>>> getConversations() {
    return ApiClient.get(
      '$_base/conversations?page=1&limit=20',
      fromJsonT: ChatConversationData.listFromJson,
    );
  }

  Future<ApiResponse<List<ChatMessageData>>> getMessages(String conversationId) {
    return ApiClient.get(
      '$_base/conversations/$conversationId/messages?page=1&limit=50',
      fromJsonT: ChatMessageData.listFromJson,
    );
  }

  Future<ApiResponse<ChatSendResponse>> sendMessage({
    required String conversationId,
    required String content,
  }) {
    return ApiClient.post(
      '$_base/conversations/$conversationId/messages',
      {'content': content},
      fromJsonT: (json) => ChatSendResponse.fromJson(json),
    );
  }

  Stream<ChatRealtimeEvent> streamMessages(String conversationId) {
    return ApiClient.stream(
      '$_base/conversations/$conversationId/stream',
      fromJsonT: (json) => ChatRealtimeEvent.fromJson(
        json is Map<String, dynamic> ? json : {},
      ),
    );
  }
}

class ChatRealtimeEvent {
  final String type;
  final ChatMessageData? message;

  ChatRealtimeEvent({
    required this.type,
    this.message,
  });

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

  ChatConversationData({
    required this.id,
    required this.type,
    this.title,
  });

  factory ChatConversationData.fromJson(Map<String, dynamic> json) {
    return ChatConversationData(
      id: json['id']?.toString() ?? '',
      type: json['type']?.toString() ?? 'ASSISTANT',
      title: json['title']?.toString(),
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
  final String senderType;
  final String content;
  final List<ChatProductRecommendation> recommendations;

  ChatMessageData({
    required this.id,
    required this.senderType,
    required this.content,
    required this.recommendations,
  });

  factory ChatMessageData.fromJson(Map<String, dynamic> json) {
    final metadata = json['metadata'];
    final recommendations = metadata is Map<String, dynamic>
        ? metadata['recommendations']
        : null;

    return ChatMessageData(
      id: json['id']?.toString() ?? '',
      senderType: json['senderType']?.toString() ?? 'ASSISTANT',
      content: json['content']?.toString() ?? '',
      recommendations: ChatProductRecommendation.listFromJson(recommendations),
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

class ChatProductRecommendation {
  final String id;
  final String name;
  final String? slug;
  final int? price;
  final String? imageUrl;

  ChatProductRecommendation({
    required this.id,
    required this.name,
    this.slug,
    this.price,
    this.imageUrl,
  });

  factory ChatProductRecommendation.fromJson(Map<String, dynamic> json) {
    return ChatProductRecommendation(
      id: (json['id'] ?? json['product_id'])?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString(),
      price: (json['price'] as num?)?.round(),
      imageUrl: json['image_url']?.toString(),
    );
  }

  static List<ChatProductRecommendation> listFromJson(dynamic json) {
    final items = json is List ? json : const [];
    return items
        .whereType<Map<String, dynamic>>()
        .map(ChatProductRecommendation.fromJson)
        .where((item) => item.id.isNotEmpty)
        .toList();
  }
}

class ChatSendResponse {
  final ChatConversationData conversation;
  final List<ChatMessageData> messages;

  ChatSendResponse({
    required this.conversation,
    required this.messages,
  });

  factory ChatSendResponse.fromJson(Map<String, dynamic> json) {
    return ChatSendResponse(
      conversation: ChatConversationData.fromJson(
        json['conversation'] is Map<String, dynamic> ? json['conversation'] : {},
      ),
      messages: ChatMessageData.listFromJson(json['messages']),
    );
  }
}
