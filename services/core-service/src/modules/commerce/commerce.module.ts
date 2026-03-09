import { Module } from '@nestjs/common';
import { CartModule } from './cart/cart.module';
import { CheckoutModule } from './checkout/checkout.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [CartModule, CheckoutModule, OrderModule]
})
export class CommerceModule {}
