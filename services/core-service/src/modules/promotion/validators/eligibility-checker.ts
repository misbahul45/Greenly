import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../libs/database/database.service';
import { EligibilityResult } from '../interfaces/discount-result.interface';

export interface PromotionForEligibility {
  id: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  minPurchaseAmount?: { toNumber(): number } | number | null;
  usageLimit?: number | null;
  usedCount: number;
  userLimit?: number | null;
  deletedAt?: Date | null;
}

@Injectable()
export class EligibilityChecker {
  constructor(private readonly db: DatabaseService) {}

  async check(
    promotion: PromotionForEligibility,
    userId: string,
    cartTotal: number,
  ): Promise<EligibilityResult> {
    if (!promotion.isActive || promotion.deletedAt) {
      return { eligible: false, reason: 'PROMO_NOT_ACTIVE' };
    }

    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      return { eligible: false, reason: 'PROMO_OUT_OF_DATE' };
    }

    if (promotion.minPurchaseAmount != null) {
      const min =
        typeof promotion.minPurchaseAmount === 'number'
          ? promotion.minPurchaseAmount
          : promotion.minPurchaseAmount.toNumber();
      if (cartTotal < min) {
        return { eligible: false, reason: 'MIN_PURCHASE_NOT_MET' };
      }
    }

    if (promotion.usageLimit != null && promotion.usedCount >= promotion.usageLimit) {
      return { eligible: false, reason: 'USAGE_LIMIT_EXCEEDED' };
    }

    if (promotion.userLimit != null) {
      const userUsage = await this.db.order.count({
        where: {
          userId,
          promotionId: promotion.id,
          status: { in: ['PAID', 'COMPLETED'] },
        },
      });

      if (userUsage >= promotion.userLimit) {
        return { eligible: false, reason: 'USER_LIMIT_EXCEEDED' };
      }
    }

    return { eligible: true };
  }
}
