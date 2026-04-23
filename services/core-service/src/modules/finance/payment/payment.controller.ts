import { Controller, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { RequireFinanceAccess } from '../shared/decorators/require-finance-access.decorator';
import { ZodValidationPipe } from '../../../libs/pipes/zod-validation.pipe';
import ErrorHandler from '../../../libs/errors/handler.error';
import {
  ListPaymentsQuerySchema,
  UpdatePaymentStatusSchema,
  type ListPaymentsQueryDto,
  type UpdatePaymentStatusDto,
} from './payment.dto';

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
