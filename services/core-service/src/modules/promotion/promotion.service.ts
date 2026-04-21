import { Injectable } from '@nestjs/common';
import { AppError } from '../../libs/errors/app.error';
import { PromotionRepository } from './promotion.repository';
import { DiscountCalculator } from './validators/discount-calculator';
import { EligibilityChecker } from './validators/eligibility-checker';
import { PromotionCreatedPublisher } from './publishers/promotion-created.publisher';
import { PromotionUsedPublisher } from './publishers/promotion-used.publisher';
import { PromotionExpiredPublisher } from './publishers/promotion-expired.publisher';
import {
  CreatePromotionDto,
  ListPromotionsQueryDto,
  UpdatePromotionDto,
  ValidatePromoQueryDto,
} from './promotion.dto';

@Injectable()
export class PromotionService {
  constructor(
    private readonly repo: PromotionRepository,
    private readonly calculator: DiscountCalculator,
    private readonly eligibilityChecker: EligibilityChecker,
    private readonly createdPublisher: PromotionCreatedPublisher,
    private readonly usedPublisher: PromotionUsedPublisher,
    private readonly expiredPublisher: PromotionExpiredPublisher,
  ) {}

  async create(dto: CreatePromotionDto, createdBy: string) {
    const promotion = await this.repo.create(dto, createdBy);

    await this.createdPublisher.publish({
      promotionId: promotion!.id,
      code: promotion!.code,
      type: promotion!.type,
      discountVal: Number(promotion!.discountVal),
      createdBy,
    });

    return { message: 'Promotion created', data: this.formatPromotion(promotion!) };
  }

  async findById(id: string) {
    const promotion = await this.repo.findById(id);
    if (!promotion) throw new AppError('Promotion not found', 404);
    return { message: 'OK', data: this.formatPromotion(promotion) };
  }

  async update(id: string, dto: UpdatePromotionDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new AppError('Promotion not found', 404);

    const updated = await this.repo.update(id, dto);
    return { message: 'Promotion updated', data: this.formatPromotion(updated!) };
  }

  async softDelete(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new AppError('Promotion not found', 404);

    await this.repo.softDelete(id);

    await this.expiredPublisher.publish({
      promotionId: existing.id,
      code: existing.code,
      endedAt: new Date().toISOString(),
    });

    return { message: 'Promotion deleted', data: null };
  }

  async list(query: ListPromotionsQueryDto) {
    const { data, total } = await this.repo.list(query);
    return {
      message: 'OK',
      data: data.map((p) => this.formatPromotion(p)),
      meta: {
        total,
        limit: query.limit ?? 20,
        offset: query.offset ?? 0,
        page: Math.floor((query.offset ?? 0) / (query.limit ?? 20)) + 1,
      },
    };
  }

  async listActive(shopId?: string) {
    const promotions = await this.repo.listActive(shopId);
    return { message: 'OK', data: promotions.map((p) => this.formatPromotion(p)) };
  }

  async validate(dto: ValidatePromoQueryDto, userId?: string) {
    const promotion = await this.repo.findByCode(dto.code);

    if (!promotion) {
      return { valid: false, reason: 'PROMO_NOT_FOUND' };
    }

    if (userId) {
      const eligibility = await this.eligibilityChecker.check(
        {
          id: promotion.id,
          isActive: promotion.isActive,
          startDate: promotion.startDate,
          endDate: promotion.endDate,
          minPurchaseAmount: promotion.minPurchaseAmount ?? null,
          usageLimit: promotion.usageLimit ?? null,
          usedCount: promotion.usedCount ?? 0,
          userLimit: promotion.userLimit ?? null,
          deletedAt: promotion.deletedAt ?? null,
        },
        userId,
        dto.cartTotal,
      );
      if (!eligibility.eligible) {
        return { valid: false, reason: eligibility.reason };
      }
    }

    const result = this.calculator.calculate(dto.cartTotal, promotion);

    return {
      valid: true,
      discountAmount: result.discountAmount,
      finalAmount: result.finalAmount,
      promotion: this.formatPromotion(promotion),
    };
  }

  async applyToOrder(code: string, userId: string, cartTotal: number, orderId: string) {
    const promotion = await this.repo.findByCode(code);
    if (!promotion) throw new AppError('Promotion not found', 404);

    const eligibility = await this.eligibilityChecker.check(
      {
        id: promotion.id,
        isActive: promotion.isActive,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        minPurchaseAmount: promotion.minPurchaseAmount ?? null,
        usageLimit: promotion.usageLimit ?? null,
        usedCount: promotion.usedCount ?? 0,
        userLimit: promotion.userLimit ?? null,
        deletedAt: promotion.deletedAt ?? null,
      },
      userId,
      cartTotal,
    );
    if (!eligibility.eligible) throw new AppError(eligibility.reason!, 400);

    const result = this.calculator.calculate(cartTotal, promotion);

    await this.repo.incrementUsage(promotion.id);

    await this.usedPublisher.publish({
      promotionId: promotion.id,
      code: promotion.code,
      userId,
      orderId,
      discountAmount: result.discountAmount,
    });

    return result;
  }

  private formatPromotion(promotion: any) {
    return {
      id: promotion.id,
      code: promotion.code,
      name: promotion.name,
      description: promotion.description ?? null,
      discountVal: Number(promotion.discountVal),
      type: promotion.type,
      minPurchaseAmount: promotion.minPurchaseAmount != null ? Number(promotion.minPurchaseAmount) : null,
      maxDiscountAmount: promotion.maxDiscountAmount != null ? Number(promotion.maxDiscountAmount) : null,
      usageLimit: promotion.usageLimit ?? null,
      usedCount: promotion.usedCount,
      userLimit: promotion.userLimit ?? null,
      startDate: promotion.startDate instanceof Date ? promotion.startDate.toISOString() : promotion.startDate,
      endDate: promotion.endDate instanceof Date ? promotion.endDate.toISOString() : promotion.endDate,
      isActive: promotion.isActive,
      createdAt: promotion.createdAt instanceof Date ? promotion.createdAt.toISOString() : promotion.createdAt,
      updatedAt: promotion.updatedAt instanceof Date ? promotion.updatedAt.toISOString() : promotion.updatedAt,
      applicableShopIds: (promotion.applicableShops ?? []).map((s: any) => s.shopId),
      applicableProductIds: (promotion.applicableProducts ?? []).map((p: any) => p.productId),
    };
  }
}
