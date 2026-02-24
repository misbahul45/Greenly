// guards/permissions.guard.ts

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator'
import { AuthRepository } from '../auth.repository'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private repo: AuthRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(
        PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      )

    if (!requiredPermissions) return true

    const request = context.switchToHttp().getRequest()
    const user = request.user

    const userPermissions =
      await this.repo.getUserPermissions(user.id)

    const hasPermission = requiredPermissions.some((perm) =>
      userPermissions.includes(perm),
    )

    if (!hasPermission) {
      throw new ForbiddenException(
        'Insufficient permissions',
      )
    }

    return true
  }
}