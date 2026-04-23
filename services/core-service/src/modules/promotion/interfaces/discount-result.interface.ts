export interface DiscountResult {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  appliedPromotion: string;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}
