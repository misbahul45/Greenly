import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { OrderCreatedPublisher } from './publishers/order-created.publisher';
import { OrderStatusChangedPublisher } from './publishers/order-status-changed.publisher';
import { PaymentCompletedPublisher, PaymentFailedPublisher } from './publishers/payment.publisher';
import { RefundProcessedPublisher } from './publishers/refund-processed.publisher';

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
    OrderCreatedPublisher,
    OrderStatusChangedPublisher,
    PaymentCompletedPublisher,
    PaymentFailedPublisher,
    RefundProcessedPublisher,
  ],
  exports: [OrderCreatedPublisher, OrderService],
})
export class OrderModule {}
