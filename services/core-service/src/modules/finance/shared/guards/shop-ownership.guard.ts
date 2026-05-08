import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from '../../../../libs/database/database.service';

@Injectable()
export class ShopOwnershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly db: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('finance_roles', context.getHandler());
    
    if (roles && !roles.includes('SHOP_OWNER')) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.user?.sub;
    const shopId = request.params?.shopId || request.body?.shopId;
    
    if (!userId) return false;

    const isAdmin = await this.db.userRole.findFirst({
      where: { userId, role: { name: 'PLATFORM_ADMIN' } }
    });
    if (isAdmin) return true;

    if (!shopId) return false;

    // Check if user is owner or finance admin
    const membership = await this.db.shopMember.findFirst({
        where: {
            userId,
            shopId,
            deletedAt: null,
        }
    });

    return membership?.role === 'OWNER' || membership?.role === 'FINANCE_ADMIN';
  }
}
