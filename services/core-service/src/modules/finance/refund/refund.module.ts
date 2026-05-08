import { Module } from '@nestjs/common';
import { RefundController } from './refund.controller';
import { RefundService } from './refund.service';
import { RefundRepository } from './refund.repository';
import { RefundProcessedPublisher } from './publishers/refund-processed.publisher';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PaymentModule],
  controllers: [RefundController],
  providers: [
    RefundService,
    RefundRepository,
    RefundProcessedPublisher,
  ],
  exports: [
    RefundService,
    RefundRepository,
  ],
})
export class RefundModule {}
