import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartUpdatedPublisher } from './publishers/cart-updated.publisher';
import { CartClearedPublisher } from './publishers/cart-cleared.publisher';
import { CartRepository } from './cart.repository';

@Module({
  controllers: [CartController],
  providers: [
    CartService,
    CartRepository,
    CartUpdatedPublisher,
    CartClearedPublisher,
  ],
  exports: [
    CartService,
    CartRepository,
  ],
})
export class CartModule {}