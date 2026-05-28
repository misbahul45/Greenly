import { Body, Controller, Get, Headers, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { RequireFinanceAccess } from '../shared/decorators/require-finance-access.decorator';
import { ZodValidationPipe } from '../../../libs/pipes/zod-validation.pipe';
import ErrorHandler from '../../../libs/errors/handler.error';
import {
  CreateStripeIntentSchema,
  type CreateStripeIntentDto,
  ListPaymentsQuerySchema,
  UpdatePaymentStatusSchema,
  type ListPaymentsQueryDto,
  type UpdatePaymentStatusDto,
} from './payment.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import type { Request } from 'express';

@Controller('admin/finance')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('payments')
  @RequireFinanceAccess('PLATFORM_ADMIN')
  async getAllPayments(
    @Query(new ZodValidationPipe(ListPaymentsQuerySchema)) query: ListPaymentsQueryDto,
  ) {
    return ErrorHandler(() => this.paymentService.getPayments(query));
  }

  @Patch('payments/:id/status')
  @RequireFinanceAccess('PLATFORM_ADMIN')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdatePaymentStatusSchema)) dto: UpdatePaymentStatusDto,
  ) {
    return ErrorHandler(() => this.paymentService.updatePaymentStatus(id, dto));
  }
}

@Controller('payments/stripe')
export class StripePaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-intent')
  createIntent(
    @CurrentUser() user: UserLogin,
    @Body(new ZodValidationPipe(CreateStripeIntentSchema)) dto: CreateStripeIntentDto,
  ) {
    return ErrorHandler(() => this.paymentService.createStripeIntent(user.sub, dto));
  }

  @Post('webhook')
  @Public()
  webhook(
    @Req() request: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature?: string,
  ) {
    return ErrorHandler(() => this.paymentService.handleStripeWebhook(request, signature));
  }
}
