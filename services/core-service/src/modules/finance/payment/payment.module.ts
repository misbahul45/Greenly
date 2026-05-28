import { Module } from '@nestjs/common';
import { PaymentController, StripePaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { PaymentCompletedPublisher, PaymentFailedPublisher } from './publishers/payment-publishers';

@Module({
  controllers: [PaymentController, StripePaymentController],
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
