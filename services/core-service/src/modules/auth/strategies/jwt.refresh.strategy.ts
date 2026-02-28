import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../auth.repository';
import { Request } from 'express';
import { AppError } from '../../../libs/errors/app.error';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private config: ConfigService,
    private repo: AuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('jwt.refresh.key') ?? 'default-refresh-secret',
      ignoreExpiration: false,
    });
  }

  async validate(req:Request, payload: any) {
    const user = await this.repo.checkUserById(payload.sub);
    const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();

    if (!user) throw new AppError('Unauthorized', 401);

    return {
      sub: user.id,
      email: user.email,
      roles: payload.roles,
      refreshToken,
      status:user.status
    };
  }
}