import { BadRequestException } from '@nestjs/common';

export const validateSufficientBalance = (
  currentBalance: number,
  requiredAmount: number,
  shopId: string,
): void => {
  if (currentBalance < requiredAmount) {
    throw new BadRequestException({
      error: 'Insufficient Balance',
      message: `Shop balance (Rp ${currentBalance}) is lower than the requested amount (Rp ${requiredAmount})`,
      shopId,
      available: currentBalance,
      required: requiredAmount,
    });
  }
};
