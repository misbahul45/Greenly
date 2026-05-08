import { Module } from '@nestjs/common';
import { PayoutController } from './payout.controller';
import { PayoutService } from './payout.service';
import { PayoutRepository } from './payout.repository';
import { PayoutStatusChangedPublisher } from './publishers/payout-status-changed.publisher';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [LedgerModule],
  controllers: [PayoutController],
  providers: [
    PayoutService,
    PayoutRepository,
    PayoutStatusChangedPublisher,
  ],
  exports: [
    PayoutService,
    PayoutRepository,
  ],
})
export class PayoutModule {}
