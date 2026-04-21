import { Module, Global } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { FinanceAdminGuard } from './guards/finance-admin.guard';
import { ShopOwnershipGuard } from './shared/guards/shop-ownership.guard';
import { LedgerModule } from './ledger/ledger.module';
import { PaymentModule } from './payment/payment.module';
import { PayoutModule } from './payout/payout.module';
import { RefundModule } from './refund/refund.module';
import { DatabaseModule } from '../../libs/database/database.module';
import { MessaggingModule } from '../../libs/messagging/messagging.module';

@Global()
@Module({
  imports: [
    DatabaseModule,
    MessaggingModule,
    LedgerModule,
    PaymentModule,
    PayoutModule,
    RefundModule,
  ],
  controllers: [FinanceController],
  providers: [
    FinanceService,
    FinanceAdminGuard,
    ShopOwnershipGuard,
  ],
  exports: [
    FinanceService,
    FinanceAdminGuard,
    ShopOwnershipGuard,
    LedgerModule,
    PaymentModule,
    PayoutModule,
    RefundModule,
  ],
})
export class FinanceModule {}
