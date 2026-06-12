import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatRealtime } from './chat.realtime';
import { ChatRepository } from './chat.repository';
import { ChatService } from './chat.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatRepository, ChatRealtime],
  exports: [ChatService],
})
export class ChatModule {}
