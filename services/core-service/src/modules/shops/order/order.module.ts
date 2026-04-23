import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderRepository } from './order.repository';
import { ShopOrderPublisher } from '../publisher/shop.order.publisher';
import { PaymentEventsConsumer } from '../consumer/payment-events.consumer';
import { MemberModule } from '../member/member.module';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [
    MemberModule,
    FinanceModule,
  ],
  controllers: [
    OrderController,
  ],
  providers: [
    OrderService,
    OrderRepository,
    ShopOrderPublisher,
    PaymentEventsConsumer,
  ],
  exports: [
    OrderService,
  ],
})
export class OrderModule {}