import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MemberRepository } from '../member/member.repository';
import { ShopAccessDeniedError } from '../../../libs/errors/domain.error';

export const MinRole = (role: string) => SetMetadata('minRole', role);

@Injectable()
export class ShopMemberGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly membersRepo: MemberRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const shopId = request.params.shopId;
    const userId = request.user?.sub;
    const requiredRole = this.reflector.get<string>('minRole', context.getHandler());
    
    if (!userId || !shopId) {
       throw new ShopAccessDeniedError(userId || 'unknown', shopId || 'unknown', 'access shop');
    }

    const membership = await this.membersRepo.findMemberByShopIdAndUserId(shopId, userId);
    
    if (!membership || membership.deletedAt) {
      throw new ShopAccessDeniedError(userId, shopId, 'manage members');
    }
    
    if (!requiredRole) return true;

    if (!this.hasSufficientRole(membership.role, requiredRole)) {
       throw new ShopAccessDeniedError(userId, shopId, `perform action requiring ${requiredRole}`);
    }

    return true;
  }
  
  private hasSufficientRole(actual: string, required: string): boolean {
    const hierarchy: Record<string, number> = { 'OWNER': 3, 'ADMIN': 2, 'STAFF': 1 };
    return hierarchy[actual] >= hierarchy[required];
  }
}
