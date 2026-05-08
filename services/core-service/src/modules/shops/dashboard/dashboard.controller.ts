import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ZodValidationPipe } from "../../../libs/pipes/zod-validation.pipe";
import ErrorHandler from "../../../libs/errors/handler.error";
import { DashboardService } from "./dashboard.service";
import { ShopMemberGuard, MinRole } from "../guards/shop-member.guard";
import {
  ShopIdParamSchema,
  type ShopIdParamDTO,
  RecentOrdersQuerySchema,
  type RecentOrdersQueryDTO,
  RevenueQuerySchema,
  type RevenueQueryDTO,
} from "./dashboard.dto";

@Controller()
@UseGuards(ShopMemberGuard)
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @MinRole("STAFF")
  @Get("/summary")
  summary(
    @Param(new ZodValidationPipe(ShopIdParamSchema))
    params: ShopIdParamDTO,
  ) {
    return ErrorHandler(() =>
      this.service.getSummary(params.shopId),
    );
  }

  @MinRole("OWNER")
  @Get("/revenue")
  revenue(
    @Param(new ZodValidationPipe(ShopIdParamSchema))
    params: ShopIdParamDTO,
    @Query(new ZodValidationPipe(RevenueQuerySchema))
    query: RevenueQueryDTO,
  ) {
    return ErrorHandler(() =>
      this.service.getRevenue(params.shopId, query.range),
    );
  }

  @MinRole("STAFF")
  @Get("/recent-orders")
  recentOrders(
    @Param(new ZodValidationPipe(ShopIdParamSchema))
    params: ShopIdParamDTO,
    @Query(new ZodValidationPipe(RecentOrdersQuerySchema))
    query: RecentOrdersQueryDTO,
  ) {
    return ErrorHandler(() =>
      this.service.getRecentOrders(params.shopId, query.limit),
    );
  }
}
