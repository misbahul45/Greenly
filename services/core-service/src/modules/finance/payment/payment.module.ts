import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { PaymentCompletedPublisher, PaymentFailedPublisher } from './publishers/payment-publishers';

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentRepository,
    PaymentCompletedPublisher,
    PaymentFailedPublisher,
  ],
  exports: [
    PaymentService,
    PaymentRepository,
  ],
})
export class PaymentModule {}
