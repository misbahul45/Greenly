import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../../libs/pipes/zod-validation.pipe';
import ErrorHandler from '../../../libs/errors/handler.error';
import {
  OrderQuerySchema,
  type OrderQueryDto,
  OrderIdParamSchema,
  type OrderIdParamDto,
  UpdateOrderStatusSchema,
  type UpdateOrderStatusDto,
  PaymentCallbackSchema,
  type PaymentCallbackDto,
  CreateRefundSchema,
  type CreateRefundDto,
} from './dto/order.dto';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  findMyOrders(
    @CurrentUser() user: UserLogin,
    @Query(new ZodValidationPipe(OrderQuerySchema)) query: OrderQueryDto,
  ) {
    return ErrorHandler(() => this.orderService.findMyOrders(user.sub, query));
  }

  @Get('shop/:shopId')
  @Roles('SELLER')
  findShopOrders(
    @Param('shopId') shopId: string,
    @Query(new ZodValidationPipe(OrderQuerySchema)) query: OrderQueryDto,
  ) {
    return ErrorHandler(() => this.orderService.findShopOrders(shopId, query));
  }

  @Get(':orderId')
  findById(
    @Param(new ZodValidationPipe(OrderIdParamSchema)) params: OrderIdParamDto,
  ) {
    return ErrorHandler(() => this.orderService.findById(params.orderId));
  }

  @Patch(':orderId/status')
  @Roles('SELLER')
  updateStatus(
    @Param(new ZodValidationPipe(OrderIdParamSchema)) params: OrderIdParamDto,
    @Body(new ZodValidationPipe(UpdateOrderStatusSchema)) dto: UpdateOrderStatusDto,
  ) {
    return ErrorHandler(() =>
      this.orderService.updateStatus(params.orderId, dto),
    );
  }

  @Post('payment-callback')
  handlePaymentCallback(
    @Body(new ZodValidationPipe(PaymentCallbackSchema)) dto: PaymentCallbackDto,
  ) {
    return ErrorHandler(() => this.orderService.handlePaymentCallback(dto));
  }

  @Post('refund')
  @Roles('ADMIN')
  createRefund(
    @Body(new ZodValidationPipe(CreateRefundSchema)) dto: CreateRefundDto,
  ) {
    return ErrorHandler(() => this.orderService.createRefund(dto));
  }
}
