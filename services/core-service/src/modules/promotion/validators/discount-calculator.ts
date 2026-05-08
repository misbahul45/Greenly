import { Injectable } from '@nestjs/common';
import { PromotionType } from '../../../../generated/prisma/enums';
import { DiscountResult } from '../interfaces/discount-result.interface';

export interface PromotionForCalculation {
  code: string;
  discountVal: { toNumber(): number } | number;
  type: PromotionType;
  maxDiscountAmount?: { toNumber(): number } | number | null;
}

function toNumber(val: { toNumber(): number } | number): number {
  return typeof val === 'number' ? val : val.toNumber();
}

@Injectable()
export class DiscountCalculator {
  calculate(cartTotal: number, promotion: PromotionForCalculation): DiscountResult {
    if (promotion.type === PromotionType.PERCENTAGE) {
      return this.calculatePercentage(cartTotal, promotion);
    }
    return this.calculateFixed(cartTotal, promotion);
  }

  private calculatePercentage(cartTotal: number, promotion: PromotionForCalculation): DiscountResult {
    const percentage = toNumber(promotion.discountVal);
    let discount = cartTotal * (percentage / 100);

    if (promotion.maxDiscountAmount != null) {
      discount = Math.min(discount, toNumber(promotion.maxDiscountAmount));
    }

    return this.buildResult(cartTotal, discount, promotion.code);
  }

  private calculateFixed(cartTotal: number, promotion: PromotionForCalculation): DiscountResult {
    const fixedAmount = toNumber(promotion.discountVal);
    const discount = Math.min(fixedAmount, cartTotal);
    return this.buildResult(cartTotal, discount, promotion.code);
  }

  private buildResult(cartTotal: number, discountAmount: number, code: string): DiscountResult {
    return {
      originalAmount: cartTotal,
      discountAmount,
      finalAmount: cartTotal - discountAmount,
      appliedPromotion: code,
    };
  }
}
