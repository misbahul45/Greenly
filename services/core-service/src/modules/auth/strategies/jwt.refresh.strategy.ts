import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { AuthRepository } from '../auth.repository'
import { Request } from 'express'
import { AppError } from '../../../libs/errors/app.error'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private config: ConfigService,
    private repo: AuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.headers['x-refresh-token'] as string
      ]),
      secretOrKey: config.get<string>('jwt.refresh.key') ?? 'default-refresh-secret',
      ignoreExpiration: false,
      passReqToCallback: true,
    })
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.headers['x-refresh-token'] as string

    if (!refreshToken) {
      throw new AppError('Refresh token missing', 401)
    }

    const user = await this.repo.checkUserById(payload.sub)

    if (!user) {
      throw new AppError('Unauthorized', 401)
    }

    return {
      sub: user.id,
      email: user.email,
      roles: payload.roles,
      refreshToken,
      status: user.status,
    }
  }
}