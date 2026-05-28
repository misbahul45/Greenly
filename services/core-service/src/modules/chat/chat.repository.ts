import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../../libs/database/database.service';
import { ChatQueryDto, CreateConversationDto } from './chat.dto';

type ChatConversationRow = {
  id: string;
  type: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastMessage: string | null;
  lastMessageAt: Date | null;
};

type ChatMessageRow = {
  id: string;
  conversationId: string;
  senderId: string | null;
  senderType: string;
  content: string;
  metadata: string | object | null;
  createdAt: Date;
};

@Injectable()
export class ChatRepository {
  constructor(private readonly db: DatabaseService) {}

  private get prisma() {
    return this.db as any;
  }

  async createConversation(userId: string, dto: CreateConversationDto) {
    const conversationId = randomUUID();
    const participantId = randomUUID();
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.$executeRaw`
        INSERT INTO chat_conversations (id, type, title, createdAt, updatedAt)
        VALUES (${conversationId}, ${dto.type}, ${dto.title ?? null}, ${now}, ${now})
      `,
      this.prisma.$executeRaw`
        INSERT INTO chat_participants (id, conversationId, userId, role, createdAt)
        VALUES (${participantId}, ${conversationId}, ${userId}, ${'OWNER'}, ${now})
      `,
    ]);

    return this.findConversation(userId, conversationId);
  }

  async findConversations(userId: string, query: ChatQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const data = await this.prisma.$queryRaw<ChatConversationRow[]>`
      SELECT c.id, c.type, c.title, c.createdAt, c.updatedAt,
        (
          SELECT m.content
          FROM chat_messages m
          WHERE m.conversationId = c.id
          ORDER BY m.createdAt DESC
          LIMIT 1
        ) AS lastMessage,
        (
          SELECT m.createdAt
          FROM chat_messages m
          WHERE m.conversationId = c.id
          ORDER BY m.createdAt DESC
          LIMIT 1
        ) AS lastMessageAt
      FROM chat_conversations c
      INNER JOIN chat_participants p ON p.conversationId = c.id
      WHERE p.userId = ${userId}
      ORDER BY c.updatedAt DESC
      LIMIT ${query.limit}
      OFFSET ${skip}
    `;
    const totalRows = await this.prisma.$queryRaw<{ total: bigint }[]>`
      SELECT COUNT(*) AS total
      FROM chat_conversations c
      INNER JOIN chat_participants p ON p.conversationId = c.id
      WHERE p.userId = ${userId}
    `;
    const total = Number(totalRows[0]?.total ?? 0);

    return {
      data: data.map((item) => this.mapConversation(item)),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        lastPage: Math.ceil(total / query.limit),
      },
    };
  }

  async findConversation(userId: string, conversationId: string) {
    const rows = await this.prisma.$queryRaw<ChatConversationRow[]>`
      SELECT c.id, c.type, c.title, c.createdAt, c.updatedAt,
        (
          SELECT m.content
          FROM chat_messages m
          WHERE m.conversationId = c.id
          ORDER BY m.createdAt DESC
          LIMIT 1
        ) AS lastMessage,
        (
          SELECT m.createdAt
          FROM chat_messages m
          WHERE m.conversationId = c.id
          ORDER BY m.createdAt DESC
          LIMIT 1
        ) AS lastMessageAt
      FROM chat_conversations c
      INNER JOIN chat_participants p ON p.conversationId = c.id
      WHERE p.userId = ${userId} AND c.id = ${conversationId}
      LIMIT 1
    `;

    return rows[0] ? this.mapConversation(rows[0]) : null;
  }

  async findMessages(userId: string, conversationId: string, query: ChatQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const data = await this.prisma.$queryRaw<ChatMessageRow[]>`
      SELECT m.id, m.conversationId, m.senderId, m.senderType, m.content, m.metadata, m.createdAt
      FROM chat_messages m
      INNER JOIN chat_participants p ON p.conversationId = m.conversationId
      WHERE p.userId = ${userId} AND m.conversationId = ${conversationId}
      ORDER BY m.createdAt DESC
      LIMIT ${query.limit}
      OFFSET ${skip}
    `;
    const totalRows = await this.prisma.$queryRaw<{ total: bigint }[]>`
      SELECT COUNT(*) AS total
      FROM chat_messages m
      INNER JOIN chat_participants p ON p.conversationId = m.conversationId
      WHERE p.userId = ${userId} AND m.conversationId = ${conversationId}
    `;
    const total = Number(totalRows[0]?.total ?? 0);

    return {
      data: data.map((item) => this.mapMessage(item)).reverse(),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        lastPage: Math.ceil(total / query.limit),
      },
    };
  }

  async createMessage(conversationId: string, senderId: string | null, senderType: string, content: string, metadata?: unknown) {
    const id = randomUUID();
    const now = new Date();
    const metadataValue = metadata === undefined ? null : JSON.stringify(metadata);

    await this.prisma.$transaction([
      this.prisma.$executeRaw`
        INSERT INTO chat_messages (id, conversationId, senderId, senderType, content, metadata, createdAt)
        VALUES (${id}, ${conversationId}, ${senderId}, ${senderType}, ${content}, ${metadataValue}, ${now})
      `,
      this.prisma.$executeRaw`
        UPDATE chat_conversations SET updatedAt = ${now} WHERE id = ${conversationId}
      `,
    ]);

    const rows = await this.prisma.$queryRaw<ChatMessageRow[]>`
      SELECT id, conversationId, senderId, senderType, content, metadata, createdAt
      FROM chat_messages
      WHERE id = ${id}
      LIMIT 1
    `;

    return this.mapMessage(rows[0]);
  }

  private mapConversation(row: ChatConversationRow) {
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lastMessage: row.lastMessage,
      lastMessageAt: row.lastMessageAt,
    };
  }

  private mapMessage(row: ChatMessageRow) {
    return {
      id: row.id,
      conversationId: row.conversationId,
      senderId: row.senderId,
      senderType: row.senderType,
      content: row.content,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      createdAt: row.createdAt,
    };
  }
}
