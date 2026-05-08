import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CartUpdatedPublisher } from './publishers/cart-updated.publisher';
import { CartClearedPublisher } from './publishers/cart-cleared.publisher';
import { AddCartItemDto, UpdateCartItemDto } from './cart.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly cartUpdatedPublisher: CartUpdatedPublisher,
    private readonly cartClearedPublisher: CartClearedPublisher,
  ) {}

  async getCart(userId: string) {
    const cart = await this.cartRepo.findCartWithItems(userId);

    if (!cart) {
      return {
        data: { id: null, userId, items: [], totalItems: 0 },
        message: 'Cart is empty',
      };
    }

    return {
      data: this.mapCartToResponse(cart),
      message: 'Cart retrieved successfully',
    };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.cartRepo.findOrCreateCart(userId);

    await this.cartRepo.upsertItem(cart.id, dto.productId, dto.quantity);

    await this.cartUpdatedPublisher.publish({
      userId,
      cartId: cart.id,
      timestamp: new Date().toISOString(),
    });

    const updated = await this.cartRepo.findCartWithItems(userId);

    return {
      data: this.mapCartToResponse(updated),
      message: 'Item added to cart',
    };
  }

  async updateItem(userId: string, productId: string, dto: UpdateCartItemDto) {
    const cart = await this.cartRepo.findCartWithItems(userId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.cartRepo.findItem(cart.id, productId);
    if (!item) {
      throw new NotFoundException(`Item with productId ${productId} not found in cart`);
    }

    await this.cartRepo.upsertItem(cart.id, productId, dto.quantity);

    await this.cartUpdatedPublisher.publish({
      userId,
      cartId: cart.id,
      timestamp: new Date().toISOString(),
    });

    const updated = await this.cartRepo.findCartWithItems(userId);

    return {
      data: this.mapCartToResponse(updated),
      message: 'Cart item updated',
    };
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.cartRepo.findCartWithItems(userId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.cartRepo.findItem(cart.id, productId);
    if (!item) {
      throw new NotFoundException(`Item with productId ${productId} not found in cart`);
    }

    await this.cartRepo.removeItem(cart.id, productId);

    await this.cartUpdatedPublisher.publish({
      userId,
      cartId: cart.id,
      timestamp: new Date().toISOString(),
    });

    return {
      data: null,
      message: 'Item removed from cart',
    };
  }

  async clearCart(userId: string) {
    const cart = await this.cartRepo.findCartWithItems(userId);

    if (!cart) {
      return { data: null, message: 'Cart is already empty' };
    }

    await this.cartRepo.clearItems(cart.id);

    await this.cartClearedPublisher.publish({
      userId,
      cartId: cart.id,
      timestamp: new Date().toISOString(),
    });

    return {
      data: null,
      message: 'Cart cleared successfully',
    };
  }

  private mapCartToResponse(cart: any) {
    return {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        createdAt: item.createdAt,
      })),
      totalItems: cart.items.length,
    };
  }
}
