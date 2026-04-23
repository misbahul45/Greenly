import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from '../../../libs/database/database.service';

@Injectable()
export class FinanceAdminGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly db: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('finance_roles', context.getHandler());
    
    if (roles && !roles.includes('PLATFORM_ADMIN')) {
        return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.user?.sub;
    
    if (!userId) return false;
    
    const userRole = await this.db.userRole.findFirst({
      where: {
        userId,
        role: { name: 'PLATFORM_ADMIN' },
      },
    });

    return !!userRole;
  }
}
