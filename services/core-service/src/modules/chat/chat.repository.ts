import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { AppError } from '../../libs/errors/app.error';
import { DatabaseService } from '../../libs/database/database.service';
import { ChatQueryDto, CreateConversationDto } from './chat.dto';

type ChatConversationRow = {
  id: string;
  type: string;
  title: string | null;
  shopId: string | null;
  buyerId: string | null;
  metadata: string | object | null;
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

type ShopOwnerRow = {
  id: string;
  ownerId: string;
};

@Injectable()
export class ChatRepository {
  constructor(private readonly db: DatabaseService) {}

  private get prisma() {
    return this.db as any;
  }

  async createConversation(userId: string, dto: CreateConversationDto) {
    const existing = await this.findShopConversation(userId, dto.shopId);
    if (existing) {
      return existing;
    }

    const shopRows = await this.prisma.$queryRaw<ShopOwnerRow[]>`
      SELECT id, ownerId
      FROM shops
      WHERE id = ${dto.shopId} AND deletedAt IS NULL
      LIMIT 1
    `;
    const shop = shopRows[0];
    if (!shop) {
      throw new AppError('Shop not found', 404);
    }

    const conversationId = randomUUID();
    const buyerParticipantId = randomUUID();
    const sellerParticipantId = randomUUID();
    const now = new Date();
    const metadataValue =
      dto.metadata === undefined ? null : JSON.stringify(dto.metadata);

    const operations = [
      this.prisma.$executeRaw`
        INSERT INTO chat_conversations
          (id, type, title, shopId, buyerId, metadata, createdAt, updatedAt)
        VALUES
          (${conversationId}, ${dto.type}, ${dto.title}, ${dto.shopId}, ${userId}, ${metadataValue}, ${now}, ${now})
      `,
      this.prisma.$executeRaw`
        INSERT INTO chat_participants (id, conversationId, userId, role, createdAt)
        VALUES (${buyerParticipantId}, ${conversationId}, ${userId}, ${'BUYER'}, ${now})
      `,
    ];

    if (shop.ownerId !== userId) {
      operations.push(
        this.prisma.$executeRaw`
          INSERT INTO chat_participants (id, conversationId, userId, role, createdAt)
          VALUES (${sellerParticipantId}, ${conversationId}, ${shop.ownerId}, ${'SELLER'}, ${now})
        `,
      );
    }

    await this.prisma.$transaction(operations);

    return this.findConversation(userId, conversationId);
  }

  async findConversations(userId: string, query: ChatQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const conditions = this.buildConversationConditions(userId, query);
    const where = Prisma.join(conditions, ' AND ');
    const data = await this.prisma.$queryRaw<ChatConversationRow[]>`
      SELECT c.id, c.type, c.title, c.shopId, c.buyerId, c.metadata, c.createdAt, c.updatedAt,
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
      WHERE ${where}
      ORDER BY c.updatedAt DESC
      LIMIT ${query.limit}
      OFFSET ${skip}
    `;
    const totalRows = await this.prisma.$queryRaw<{ total: bigint }[]>`
      SELECT COUNT(*) AS total
      FROM chat_conversations c
      INNER JOIN chat_participants p ON p.conversationId = c.id
      WHERE ${where}
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
      SELECT c.id, c.type, c.title, c.shopId, c.buyerId, c.metadata, c.createdAt, c.updatedAt,
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

  async createMessage(
    conversationId: string,
    senderId: string | null,
    senderType: string,
    content: string,
    metadata?: unknown,
  ) {
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

  private async findShopConversation(userId: string, shopId: string) {
    const rows = await this.prisma.$queryRaw<ChatConversationRow[]>`
      SELECT c.id, c.type, c.title, c.shopId, c.buyerId, c.metadata, c.createdAt, c.updatedAt,
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
      WHERE p.userId = ${userId} AND c.type = ${'SHOP'} AND c.shopId = ${shopId}
      LIMIT 1
    `;

    return rows[0] ? this.mapConversation(rows[0]) : null;
  }

  private buildConversationConditions(userId: string, query: ChatQueryDto) {
    const conditions = [Prisma.sql`p.userId = ${userId}`];

    if (query.type) {
      conditions.push(Prisma.sql`c.type = ${query.type}`);
    }

    if (query.shopId) {
      conditions.push(Prisma.sql`c.shopId = ${query.shopId}`);
    }

    return conditions;
  }

  private mapConversation(row: ChatConversationRow) {
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      shopId: row.shopId,
      buyerId: row.buyerId,
      metadata: this.parseJson(row.metadata),
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
      metadata: this.parseJson(row.metadata),
      createdAt: row.createdAt,
    };
  }

  private parseJson(value: string | object | null) {
    if (typeof value !== 'string') return value;

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
}
