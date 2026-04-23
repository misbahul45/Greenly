import { Module } from "@nestjs/common";
import { FinanceService } from "./finance.service";
import { FinanceController } from "./finance.controller";
import { FinanceRepository } from "./finance.repo";
import { ShopFinancePublisher } from "../publisher/shop.finance.publisher";
import { MemberModule } from "../member/member.module";
import { ShopMemberGuard } from "../guards/shop-member.guard";

@Module({
  imports: [MemberModule],
  controllers: [
    FinanceController,
  ],
  providers: [
    FinanceService,
    FinanceRepository,
    ShopFinancePublisher,
    ShopMemberGuard,
  ],
  exports: [
    FinanceService,
  ],
})
export class FinanceModule {}