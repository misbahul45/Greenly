import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../libs/database/database.service';
import { CartRepository } from '../cart/cart.repository';
import { CheckoutDto } from './checkout.dto';
import { CheckoutInitiatedPublisher } from './checkout-initiated.publisher';
import { OrderCreatedPublisher } from '../order/publishers/order-created.publisher';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly db: DatabaseService,
    private readonly cartRepo: CartRepository,
    private readonly checkoutInitiatedPublisher: CheckoutInitiatedPublisher,
    private readonly orderCreatedPublisher: OrderCreatedPublisher,
  ) {}

  async checkout(userId: string, dto: CheckoutDto) {
    const cart = await this.cartRepo.findCartWithItems(userId);

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const selectedItems = cart.items.filter((item) =>
      dto.itemIds.includes(item.productId),
    );

    if (selectedItems.length === 0) {
      throw new BadRequestException('No valid items selected for checkout');
    }

    const promo = dto.promoCode
      ? await this.db.promotion.findFirst({
          where: {
            code: dto.promoCode,
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        })
      : null;

    const subtotal = selectedItems.reduce(
      (sum, item) => sum + item.quantity * 10000,
      0,
    );

    let discount = 0;
    if (promo) {
      discount =
        promo.type === 'PERCENTAGE'
          ? subtotal * (Number(promo.discountVal) / 100)
          : Number(promo.discountVal);
    }

    const totalAmount = Math.max(subtotal - discount, 0);
    const grossAmount = totalAmount;
    const marketplaceFee = grossAmount * 0.02;
    const gatewayFee = grossAmount * 0.01;
    const netAmount = grossAmount - marketplaceFee - gatewayFee;

    const order = await this.db.$transaction(async (tx) => {
      const shop = await tx.shop.findUnique({ where: { id: dto.shopId } });
      if (!shop) {
        throw new NotFoundException(`Shop ${dto.shopId} not found`);
      }

      const newOrder = await tx.order.create({
        data: {
          userId,
          shopId: dto.shopId,
          shopName: shop.name,
          totalAmount,
          status: 'PENDING',
          items: {
            create: selectedItems.map((item) => ({
              productId: item.productId,
              productName: item.productId,
              price: 10000,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          grossAmount,
          gatewayFee,
          marketplaceFee,
          netAmount,
          method: dto.paymentMethod,
          status: 'PENDING',
        },
      });

      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId: { in: dto.itemIds },
        },
      });

      return newOrder;
    });

    await this.checkoutInitiatedPublisher.publish({
      userId,
      orderId: order.id,
      totalAmount: totalAmount.toString(),
      timestamp: new Date().toISOString(),
    });

    await this.orderCreatedPublisher.publish({
      orderId: order.id,
      userId,
      shopId: dto.shopId,
      totalAmount: totalAmount.toString(),
      timestamp: new Date().toISOString(),
    });

    return {
      data: {
        orderId: order.id,
        totalAmount,
        discount,
        itemsCount: selectedItems.length,
        status: 'PENDING',
      },
      message: 'Checkout successful',
    };
  }
}
