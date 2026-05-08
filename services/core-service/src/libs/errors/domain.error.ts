import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

export class ShopNotFoundError extends NotFoundException {
  constructor(shopId: string) {
    super(`Shop with id ${shopId} not found`);
    this.name = 'ShopNotFoundError';
  }
}

export class ShopAccessDeniedError extends ForbiddenException {
  constructor(userId: string, shopId: string, action: string) {
    super(`User ${userId} cannot ${action} on shop ${shopId}`);
    this.name = 'ShopAccessDeniedError';
  }
}

export class ApplicationNotFoundError extends NotFoundException {
  constructor(shopId: string) {
    super(`Application for shop ${shopId} not found`);
    this.name = 'ApplicationNotFoundError';
  }
}

export class InvalidStateTransitionError extends BadRequestException {
  constructor(current: string, target: string) {
    super(`Invalid state transition from ${current} to ${target}`);
    this.name = 'InvalidStateTransitionError';
  }
}

export class InsufficientBalanceError extends BadRequestException {
  constructor(current: string, required: string) {
    super(`Insufficient balance: ${current} < ${required}`);
    this.name = 'InsufficientBalanceError';
  }
}

export class CannotFollowOwnShopError extends BadRequestException {
  constructor(userId: string, shopId: string) {
    super(`User ${userId} cannot follow their own shop ${shopId}`);
    this.name = 'CannotFollowOwnShopError';
  }
}
