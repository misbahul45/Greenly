import { Controller, Get, Patch, Query, Param, Body } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../libs/pipes/zod-validation.pipe';
import { OrderService } from './order.service';
import ErrorHandler from '../../../libs/errors/handler.error';
import {
  OrderQuerySchema,
  type OrderQueryDTO,
  OrderIdParamSchema,
  type OrderIdParamDTO,
  UpdateOrderStatusSchema,
  type UpdateOrderStatusDTO,
  RefundParamSchema,
  type RefundParamDTO,
} from './order.dto';
import {
  type ShopIdParamDTO,
  ShopIdParamSchema,
} from '../shops.dto';


@Controller('')
@Roles('ADMIN')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Get()
  findAll(
    @Param(new ZodValidationPipe(ShopIdParamSchema))
    params: ShopIdParamDTO,
    @Query(new ZodValidationPipe(OrderQuerySchema))
    query: OrderQueryDTO,
  ) {
    return ErrorHandler(() =>
      this.service.findAll(params.shopId, query),
    );
  }

  @Get('/:id')
  findOne(
    @Param(
      new ZodValidationPipe(
        ShopIdParamSchema.merge(OrderIdParamSchema),
      ),
    )
    params: ShopIdParamDTO & OrderIdParamDTO,
  ) {
    return ErrorHandler(() =>
      this.service.findOne(params.shopId, params.id),
    );
  }

  @Patch('/:id/status')
  updateStatus(
    @Param(
      new ZodValidationPipe(
        ShopIdParamSchema.merge(OrderIdParamSchema),
      ),
    )
    params: ShopIdParamDTO & OrderIdParamDTO,
    @Body(new ZodValidationPipe(UpdateOrderStatusSchema))
    body: UpdateOrderStatusDTO,
  ) {
    return ErrorHandler(() =>
      this.service.updateStatus(
        params.shopId,
        params.id,
        body.status,
      ),
    );
  }

  @Patch('/:id/refund/:refundId')
  updateRefund(
    @Param(new ZodValidationPipe(RefundParamSchema))
    params: RefundParamDTO,
  ) {
    return ErrorHandler(() =>
      this.service.updateRefund(
        params.shopId,
        params.id,
        params.refundId,
      ),
    );
  }
}