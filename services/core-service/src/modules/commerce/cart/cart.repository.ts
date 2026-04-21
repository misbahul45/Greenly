import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../libs/database/database.service';

@Injectable()
export class CartRepository {
  constructor(private readonly db: DatabaseService) {}

  async findOrCreateCart(userId: string) {
    return this.db.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: true,
      },
    });
  }

  async findCartWithItems(userId: string) {
    return this.db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async upsertItem(cartId: string, productId: string, quantity: number) {
    return this.db.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      create: { cartId, productId, quantity },
      update: { quantity },
    });
  }

  async removeItem(cartId: string, productId: string) {
    return this.db.cartItem.delete({
      where: { cartId_productId: { cartId, productId } },
    });
  }

  async clearItems(cartId: string) {
    return this.db.cartItem.deleteMany({ where: { cartId } });
  }

  async findItem(cartId: string, productId: string) {
    return this.db.cartItem.findUnique({
      where: { cartId_productId: { cartId, productId } },
    });
  }

  async findItemsByIds(cartId: string, itemIds: string[]) {
    return this.db.cartItem.findMany({
      where: {
        cartId,
        productId: { in: itemIds },
      },
    });
  }

  async countItems(cartId: string): Promise<number> {
    return this.db.cartItem.count({ where: { cartId } });
  }
}
