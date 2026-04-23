import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { FinanceAdminGuard } from '../../guards/finance-admin.guard';
import { ShopOwnershipGuard } from '../guards/shop-ownership.guard';
import { JwtAccessGuard } from '../../../auth/guards/jwt.access.guard';

export const RequireFinanceAccess = (...roles: string[]) => {
  return applyDecorators(
    SetMetadata('finance_roles', roles),
    UseGuards(JwtAccessGuard, FinanceAdminGuard, ShopOwnershipGuard),
  );
};
