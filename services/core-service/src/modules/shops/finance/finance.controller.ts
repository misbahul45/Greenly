import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ZodValidationPipe } from "../../../libs/pipes/zod-validation.pipe";
import ErrorHandler from "../../../libs/errors/handler.error";
import { FinanceService } from "./finance.service";
import { ShopMemberGuard, MinRole } from "../guards/shop-member.guard";
import {
  FinanceShopIdParamSchema,
  type FinanceShopIdParamDTO,
  LedgerQuerySchema,
  type LedgerQueryDTO,
  CreatePayoutSchema,
  type CreatePayoutDTO,
  PayoutQuerySchema,
  type PayoutQueryDTO,
} from "./finance.dto";

@Controller()
@UseGuards(ShopMemberGuard)
export class FinanceController {
  constructor(private readonly service: FinanceService) {}

  @MinRole("ADMIN")
  @Get("/balance")
  balance(
    @Param(new ZodValidationPipe(FinanceShopIdParamSchema))
    params: FinanceShopIdParamDTO,
  ) {
    return ErrorHandler(() =>
      this.service.getBalance(params.shopId),
    );
  }

  @MinRole("ADMIN")
  @Get("/ledger")
  ledger(
    @Param(new ZodValidationPipe(FinanceShopIdParamSchema))
    params: FinanceShopIdParamDTO,
    @Query(new ZodValidationPipe(LedgerQuerySchema))
    query: LedgerQueryDTO,
  ) {
    return ErrorHandler(() =>
      this.service.getLedger(params.shopId, query),
    );
  }

  @MinRole("OWNER")
  @Post("/payout")
  payout(
    @Param(new ZodValidationPipe(FinanceShopIdParamSchema))
    params: FinanceShopIdParamDTO,
    @Body(new ZodValidationPipe(CreatePayoutSchema))
    body: CreatePayoutDTO,
  ) {
    return ErrorHandler(() =>
      this.service.requestPayout(params.shopId, body),
    );
  }

  @MinRole("ADMIN")
  @Get("/payouts")
  findPayouts(
    @Param(new ZodValidationPipe(FinanceShopIdParamSchema))
    params: FinanceShopIdParamDTO,
    @Query(new ZodValidationPipe(PayoutQuerySchema))
    query: PayoutQueryDTO,
  ) {
    return ErrorHandler(() =>
      this.service.getPayouts(params.shopId, query),
    );
  }
}
