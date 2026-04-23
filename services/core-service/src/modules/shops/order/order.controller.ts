import { Controller, Get, Patch, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ShopMemberGuard, MinRole } from '../guards/shop-member.guard';
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
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @UseGuards(ShopMemberGuard)
  @MinRole("STAFF")
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

  @UseGuards(ShopMemberGuard)
  @MinRole("STAFF")
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

  @UseGuards(ShopMemberGuard)
  @MinRole("ADMIN")
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
      this.service.updateOrderStatus(
        params.shopId,
        params.id,
        body.status,
      ),
    );
  }

  @UseGuards(ShopMemberGuard)
  @MinRole("OWNER")
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