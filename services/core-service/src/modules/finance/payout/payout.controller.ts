import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { RequireFinanceAccess } from '../shared/decorators/require-finance-access.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../../libs/pipes/zod-validation.pipe';
import ErrorHandler from '../../../libs/errors/handler.error';
import {
  CreatePayoutRequestSchema,
  ApprovePayoutSchema,
  RejectPayoutSchema,
  ListPayoutsQuerySchema,
  type CreatePayoutRequestDto,
  type ApprovePayoutDto,
  type RejectPayoutDto,
  type ListPayoutsQueryDto,
} from './payout.dto';
import { type UserPayload } from '../finance.dto';

@Controller()
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  // ==========================================
  // SHOP OWNER ROUTES
  // ==========================================
  @Get('shops/:shopId/finance/payouts')
  @RequireFinanceAccess('SHOP_OWNER', 'PLATFORM_ADMIN')
  async getShopPayouts(
    @Param('shopId') shopId: string,
    @Query(new ZodValidationPipe(ListPayoutsQuerySchema)) query: ListPayoutsQueryDto,
  ) {
    return ErrorHandler(() => this.payoutService.listByShop(shopId, query));
  }

  @Post('shops/:shopId/finance/payouts/request')
  @RequireFinanceAccess('SHOP_OWNER')
  async requestPayout(
    @Param('shopId') shopId: string,
    @Body(new ZodValidationPipe(CreatePayoutRequestSchema)) dto: CreatePayoutRequestDto,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.sub || user.id;
    return ErrorHandler(() => this.payoutService.requestPayout(userId as string, { ...dto, shopId }));
  }

  // ==========================================
  // ADMIN ROUTES
  // ==========================================
  @Patch('admin/finance/payouts/:id/approve')
  @RequireFinanceAccess('PLATFORM_ADMIN')
  async approvePayout(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ApprovePayoutSchema)) dto: ApprovePayoutDto,
    @CurrentUser() admin: UserPayload,
  ) {
    const adminId = admin.sub || admin.id;
    return ErrorHandler(() => this.payoutService.approveByAdmin(id, dto, adminId as string));
  }

  @Patch('admin/finance/payouts/:id/reject')
  @RequireFinanceAccess('PLATFORM_ADMIN')
  async rejectPayout(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(RejectPayoutSchema)) dto: RejectPayoutDto,
  ) {
    return ErrorHandler(() => this.payoutService.rejectByAdmin(id, dto));
  }
}
