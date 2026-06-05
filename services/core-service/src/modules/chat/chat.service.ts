import { Injectable, MessageEvent } from '@nestjs/common';
import { from, Observable, switchMap } from 'rxjs';
import { AppError } from '../../libs/errors/app.error';
import { ChatQueryDto, CreateConversationDto, SendMessageDto } from './chat.dto';
import { ChatRealtime } from './chat.realtime';
import { ChatRepository } from './chat.repository';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepo: ChatRepository,
    private readonly chatRealtime: ChatRealtime,
  ) {}

  async createConversation(userId: string, dto: CreateConversationDto) {
    const conversation = await this.chatRepo.createConversation(userId, dto);

    return {
      data: conversation,
      message: 'Conversation created successfully',
    };
  }

  async findConversations(userId: string, query: ChatQueryDto) {
    const result = await this.chatRepo.findConversations(userId, query);

    return {
      data: result.data,
      meta: result.meta,
      message: 'Conversations fetched successfully',
    };
  }

  async findMessages(userId: string, conversationId: string, query: ChatQueryDto) {
    await this.ensureConversation(userId, conversationId);
    const result = await this.chatRepo.findMessages(userId, conversationId, query);

    return {
      data: result.data,
      meta: result.meta,
      message: 'Messages fetched successfully',
    };
  }

  async sendMessage(userId: string, conversationId: string, dto: SendMessageDto) {
    const conversation = await this.ensureConversation(userId, conversationId);
    const userMessage = await this.chatRepo.createMessage(
      conversation.id,
      userId,
      'USER',
      dto.content,
    );

    this.chatRealtime.emit(conversation.id, 'chat.message_created', userMessage);

    const messages = await this.chatRepo.findMessages(userId, conversationId, {
      page: 1,
      limit: 30,
    });

    return {
      data: {
        conversation,
        messages: messages.data,
      },
      message: 'Message sent successfully',
    };
  }

  stream(userId: string, conversationId: string): Observable<MessageEvent> {
    return from(this.ensureConversation(userId, conversationId)).pipe(
      switchMap(() => this.chatRealtime.stream(conversationId)),
    );
  }

  private async ensureConversation(userId: string, conversationId: string) {
    const conversation = await this.chatRepo.findConversation(userId, conversationId);
    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }
    return conversation;
  }
}
