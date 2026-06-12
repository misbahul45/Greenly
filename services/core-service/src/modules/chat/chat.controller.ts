import { Body, Controller, Get, Param, Post, Query, Sse } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../libs/pipes/zod-validation.pipe';
import ErrorHandler from '../../libs/errors/handler.error';
import { ChatService } from './chat.service';
import {
  ChatQuerySchema,
  ConversationParamSchema,
  CreateConversationSchema,
  SendMessageSchema,
} from './chat.dto';
import type {
  ChatQueryDto,
  ConversationParamDto,
  CreateConversationDto,
  SendMessageDto,
} from './chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  findConversations(
    @CurrentUser() user: UserLogin,
    @Query(new ZodValidationPipe(ChatQuerySchema)) query: ChatQueryDto,
  ) {
    return ErrorHandler(() => this.chatService.findConversations(user.sub, query));
  }

  @Post('conversations')
  createConversation(
    @CurrentUser() user: UserLogin,
    @Body(new ZodValidationPipe(CreateConversationSchema)) dto: CreateConversationDto,
  ) {
    return ErrorHandler(() => this.chatService.createConversation(user.sub, dto));
  }

  @Get('conversations/:id/messages')
  findMessages(
    @CurrentUser() user: UserLogin,
    @Param(new ZodValidationPipe(ConversationParamSchema)) params: ConversationParamDto,
    @Query(new ZodValidationPipe(ChatQuerySchema)) query: ChatQueryDto,
  ) {
    return ErrorHandler(() => this.chatService.findMessages(user.sub, params.id, query));
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @CurrentUser() user: UserLogin,
    @Param(new ZodValidationPipe(ConversationParamSchema)) params: ConversationParamDto,
    @Body(new ZodValidationPipe(SendMessageSchema)) dto: SendMessageDto,
  ) {
    return ErrorHandler(() => this.chatService.sendMessage(user.sub, params.id, dto));
  }

  @Sse('conversations/:id/stream')
  stream(
    @CurrentUser() user: UserLogin,
    @Param(new ZodValidationPipe(ConversationParamSchema)) params: ConversationParamDto,
  ) {
    return this.chatService.stream(user.sub, params.id);
  }
}
