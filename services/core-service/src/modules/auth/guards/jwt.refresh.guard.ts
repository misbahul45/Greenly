import { ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  constructor(private reflector: Reflector) {
    super()
  }
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest()
    console.log('JwtRefreshGuard: canActivate called with request:', req.headers)
    return super.canActivate(context)
  }
}