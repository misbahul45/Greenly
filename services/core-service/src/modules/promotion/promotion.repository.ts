import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../libs/database/database.service';
import { CreatePromotionDto, ListPromotionsQueryDto, UpdatePromotionDto } from './promotion.dto';

@Injectable()
export class PromotionRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreatePromotionDto, _createdBy: string) {
    const { applicableShopIds = [], applicableProductIds = [], ...promotionData } = dto;

    return this.db.$transaction(async (tx) => {
      const promotion = await (tx as any).promotion.create({
        data: {
          ...promotionData,
          code: promotionData.code.toUpperCase(),
          usedCount: 0,
          isActive: promotionData.isActive ?? true,
          startDate: new Date(promotionData.startDate),
          endDate: new Date(promotionData.endDate),
        },
      });

      if (applicableShopIds.length > 0) {
        await (tx as any).promotionShop.createMany({
          data: applicableShopIds.map((shopId) => ({ promotionId: promotion.id, shopId })),
        });
      }

      if (applicableProductIds.length > 0) {
        await (tx as any).promotionProduct.createMany({
          data: applicableProductIds.map((productId) => ({ promotionId: promotion.id, productId })),
        });
      }

      return this.findById(promotion.id, tx as any);
    });
  }

  async findByCode(code: string) {
    return (this.db as any).promotion.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        deletedAt: null,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      include: {
        applicableShops: true,
        applicableProducts: true,
      },
    });
  }

  async findById(id: string, db?: any) {
    const client = db ?? (this.db as any);
    return client.promotion.findFirst({
      where: { id, deletedAt: null },
      include: {
        applicableShops: true,
        applicableProducts: true,
      },
    });
  }

  async update(id: string, dto: UpdatePromotionDto) {
    const { applicableShopIds, applicableProductIds, ...promotionData } = dto;

    return this.db.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = { ...promotionData };
      if (promotionData.startDate) updateData.startDate = new Date(promotionData.startDate);
      if (promotionData.endDate) updateData.endDate = new Date(promotionData.endDate);
      if (promotionData.code) updateData.code = promotionData.code.toUpperCase();

      await (tx as any).promotion.update({ where: { id }, data: updateData });

      if (applicableShopIds !== undefined) {
        await (tx as any).promotionShop.deleteMany({ where: { promotionId: id } });
        if (applicableShopIds.length > 0) {
          await (tx as any).promotionShop.createMany({
            data: applicableShopIds.map((shopId) => ({ promotionId: id, shopId })),
          });
        }
      }

      if (applicableProductIds !== undefined) {
        await (tx as any).promotionProduct.deleteMany({ where: { promotionId: id } });
        if (applicableProductIds.length > 0) {
          await (tx as any).promotionProduct.createMany({
            data: applicableProductIds.map((productId) => ({ promotionId: id, productId })),
          });
        }
      }

      return this.findById(id, tx as any);
    });
  }

  async incrementUsage(promotionId: string): Promise<void> {
    await (this.db as any).promotion.update({
      where: { id: promotionId },
      data: { usedCount: { increment: 1 } },
    });
  }

  async list(query: ListPromotionsQueryDto) {
    const where: Record<string, unknown> = { deletedAt: null };

    if (query.shopId) where.applicableShops = { some: { shopId: query.shopId } };
    if (query.type) where.type = query.type;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.startDateFrom) where.startDate = { gte: new Date(query.startDateFrom) };
    if (query.startDateTo) where.endDate = { lte: new Date(query.startDateTo) };

    const [data, total] = await Promise.all([
      (this.db as any).promotion.findMany({
        where,
        orderBy: { [query.sortBy ?? 'createdAt']: query.order ?? 'desc' },
        take: query.limit,
        skip: query.offset,
        include: { applicableShops: true, applicableProducts: true },
      }),
      (this.db as any).promotion.count({ where }),
    ]);

    return { data, total };
  }

  async listActive(shopId?: string) {
    const now = new Date();
    const where: Record<string, unknown> = {
      isActive: true,
      deletedAt: null,
      startDate: { lte: now },
      endDate: { gte: now },
    };

    if (shopId) where.applicableShops = { some: { shopId } };

    return (this.db as any).promotion.findMany({
      where,
      include: { applicableShops: true, applicableProducts: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async softDelete(id: string): Promise<void> {
    await (this.db as any).promotion.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
