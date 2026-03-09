import { Module } from '@nestjs/common';
import { PaymentModule } from './payment/payment.module';
import { RefundModule } from './refund/refund.module';
import { PayoutModule } from './payout/payout.module';
import { LedgerModule } from './ledger/ledger.module';

@Module({
  imports: [PaymentModule, RefundModule, PayoutModule, LedgerModule]
})
export class FinanceModule {}
