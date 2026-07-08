import { Promotion } from '@prisma/client';
import { CartItemDto } from '../promotion.dto';
import { DiscountResult } from './discount-result.interface';

export interface DiscountStrategy {
  calculate(cartTotal: number, promotion: Promotion, items?: CartItemDto[]): DiscountResult;
}
