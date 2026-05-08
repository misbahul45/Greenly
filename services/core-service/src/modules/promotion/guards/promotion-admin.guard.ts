import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { DatabaseService } from '../../../libs/database/database.service';

@Injectable()
export class PromotionAdminGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
