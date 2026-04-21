import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { RefundService } from './refund.service';
import { RequireFinanceAccess } from '../shared/decorators/require-finance-access.decorator';
import { ZodValidationPipe } from '../../../libs/pipes/zod-validation.pipe';
import ErrorHandler from '../../../libs/errors/handler.error';
import {
  ListRefundsQuerySchema,
  CreateRefundSchema,
  ApproveRefundSchema,
  ForceRefundSchema,
  type ListRefundsQueryDto,
  type CreateRefundDto,
  type ApproveRefundDto,
  type ForceRefundDto,
} from './refund.dto';

@Controller()
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Get('shops/:shopId/finance/refunds')
  @RequireFinanceAccess('SHOP_OWNER')
  async getShopRefunds(
    @Param('shopId') shopId: string,
    @Query(new ZodValidationPipe(ListRefundsQuerySchema)) query: ListRefundsQueryDto,
  ) {
    return ErrorHandler(() => this.refundService.listRefunds(query, shopId));
  }

  @Post('shops/:shopId/finance/refunds')
  @RequireFinanceAccess('SHOP_OWNER')
  async requestShopRefund(
    @Param('shopId') shopId: string,
    @Body(new ZodValidationPipe(CreateRefundSchema)) dto: CreateRefundDto,
  ) {
    return ErrorHandler(() => this.refundService.createRefund({ ...dto, shopId }));
  }


  @Get('admin/finance/refunds')
  @RequireFinanceAccess('PLATFORM_ADMIN')
  async getAllRefunds(
    @Query(new ZodValidationPipe(ListRefundsQuerySchema)) query: ListRefundsQueryDto,
  ) {
    return ErrorHandler(() => this.refundService.listRefunds(query));
  }

  @Post('admin/finance/refunds')
  @RequireFinanceAccess('PLATFORM_ADMIN')
  async requestAdminRefund(
    @Body(new ZodValidationPipe(CreateRefundSchema)) dto: CreateRefundDto,
  ) {
    return ErrorHandler(() => this.refundService.createRefund(dto));
  }

  @Patch('admin/finance/refunds/:id/approve')
  @RequireFinanceAccess('PLATFORM_ADMIN')
  async approveRefund(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ApproveRefundSchema)) dto: ApproveRefundDto,
  ) {
    return ErrorHandler(() => this.refundService.approveRefund(id, dto));
  }

  @Patch('admin/finance/refunds/:id/reject')
  @RequireFinanceAccess('PLATFORM_ADMIN')
  async rejectRefund(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ApproveRefundSchema)) dto: ApproveRefundDto,
  ) {
    return ErrorHandler(() => this.refundService.rejectRefund(id, dto));
  }

  @Post('admin/finance/refunds/:id/force-approve')
  @RequireFinanceAccess('PLATFORM_ADMIN')
  async forceApproveRefund(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ForceRefundSchema)) dto: ForceRefundDto,
  ) {
    return ErrorHandler(() => this.refundService.forceApprove(id, dto));
  }
}
